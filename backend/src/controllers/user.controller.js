import User from "../models/user.model.js";
import { StripeService } from "../services/stripeService.js";
import jwt from "jsonwebtoken";
import {
  newUserRegistrationEmail,
  resetPasswordEmail,
  welcomeEmail,
} from "../utils/nodemailer.js";
import crypto from "crypto";
import BidPayment from "../models/bidPayment.model.js";
import { deleteFromCloudinary, uploadDocumentToCloudinary, uploadImageToCloudinary } from "../utils/cloudinary.js";
import Stripe from 'stripe';
import { notifyAdminsAndStaffWithPermission } from '../services/notificationService.js';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Helper function to generate tokens and set cookies
const generateTokensAndRespond = async (user, req, res, message) => {
  try {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    const resetToken = user.generateResetPasswordToken();

    // Save refresh token to user document
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Remove sensitive data from user object
    const safeUser = user.toSafeObject();

    // await loginUser(req, res);

    // Set cookies and send response
    res
      .status(201)
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 60 * 1000, // 30 minutes
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      })
      .json({
        success: true,
        message,
        data: {
          user: safeUser,
          accessToken,
          refreshToken,
        },
      });
  } catch (error) {
    throw new Error(`Token generation failed: ${error.message}`);
  }
};

// Registration Controller
export const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      userType,
      countryCode,
      countryName,
      phone = "",
      image = "",
      dealershipName = "",
      buildingNameNo = "",
      street = "",
      city = "",
      county = "",
      postCode = "",
      paymentMethodId,
      cardSaveConsent,
    } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.toLowerCase().trim();

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email or username already exists",
      });
    }

    // ---- Validate bidder payment requirements ----
    if (userType === "bidder") {
      if (!paymentMethodId) {
        return res.status(400).json({
          success: false,
          message: "Payment method is required for bidders",
        });
      }
      const consentGiven = cardSaveConsent === "true" || cardSaveConsent === true;
      if (!consentGiven) {
        return res.status(400).json({
          success: false,
          message:
            "You must consent to card storage and off-session deposit charges",
        });
      }
    }

    // ---- Handle ID document upload ----
    const identificationDocumentFile = req.file;
    let identificationDocumentUrl = null;
    let identificationDocumentPublicId = null;

    if (identificationDocumentFile) {
      const isImage = identificationDocumentFile.mimetype.startsWith("image/");
      const uploadFn = isImage
        ? uploadImageToCloudinary
        : uploadDocumentToCloudinary;

      const uploadResult = await uploadFn(
        identificationDocumentFile.buffer,
        isImage ? undefined : identificationDocumentFile.originalname,
        "identification-documents"
      );
      identificationDocumentUrl = uploadResult.secure_url;
      identificationDocumentPublicId = uploadResult.public_id;
    }

    // ---- Stripe setup for bidders ----
    let stripeCustomerId = null;
    let setupIntentId = null;
    let setupIntentClientSecret = null;

    if (userType === "bidder") {
      try {
        const customer = await StripeService.createCustomer(
          normalizedEmail,
          `${firstName} ${lastName}`,
          { userType, source: "registration" }
        );
        stripeCustomerId = customer.id;

        await StripeService.attachPaymentMethod(
          stripeCustomerId,
          paymentMethodId
        );

        const setupIntent = await StripeService.createSetupIntent(
          stripeCustomerId,
          paymentMethodId,
          { email: normalizedEmail, userType }
        );
        setupIntentId = setupIntent.id;
        setupIntentClientSecret = setupIntent.client_secret;
      } catch (stripeError) {
        console.error("Stripe setup failed during registration:", stripeError);
        return res.status(400).json({
          success: false,
          message:
            stripeError.message ||
            "Failed to set up payment method. Please try a different card.",
        });
      }
    }

    // ---- Build user data ----
    const userData = {
      firstName,
      lastName,
      username: normalizedUsername,
      email: normalizedEmail,
      password,
      userType,
      countryCode,
      countryName,
      phone,
      image,
      isVerified: true,
      identificationDocument: identificationDocumentUrl,
      identificationDocumentPublicId,
      identificationStatus: identificationDocumentUrl ? "pending" : "verified",
      address: {
        dealershipName,
        buildingNameNo,
        street,
        city,
        county,
        postCode,
        country: countryName,
      },
    };

    if (userType === "bidder") {
      userData.stripeCustomerId = stripeCustomerId;
      userData.paymentMethodId = paymentMethodId;
      userData.pendingSetupIntentId = setupIntentId;
      userData.isPaymentVerified = false;
      userData.cardSaveConsentAt = new Date();
      userData.cardSaveConsentIp =
        req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress;
    }

    const user = await User.create(userData);

    // ---- Bidder: return client secret, client must confirm ----
    if (userType === "bidder") {
      const registrationToken = jwt.sign(
        { userId: user._id, purpose: "registration" },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "30m" }
      );

      return res.status(201).json({
        success: true,
        requiresAction: true,
        clientSecret: setupIntentClientSecret,
        setupIntentId,
        registrationToken,
        message: "Please verify your card to complete registration",
      });
    }

    // ---- Non-bidder: complete immediately ----
    await generateTokensAndRespond(user, req, res, "Registration successful");
    welcomeEmail(user).catch((err) =>
      console.error(`Failed to send user welcome email to ${user?.email}:`, err)
    );;

    const adminUsers = await User.find({ userType: "admin" });
    for (const admin of adminUsers) {
      newUserRegistrationEmail(admin.email, user).catch((err) =>
        console.error(`Failed to send new use admin email to ${admin?.email}:`, err)
      );
    }

    // In-app admin notification
    notifyAdminsAndStaffWithPermission('ADMIN_NEW_USER_REGISTERED', {
      title: 'New user registered',
      message: `${user.firstName} ${user.lastName} (${user.userType}) — ${user.email}`,
      actionUrl: `/admin/users`,
      relatedEntity: { type: 'User', id: user._id },
      metadata: { userId: user._id, userType: user.userType, email: user.email },
    }).catch((err) => console.error('notify ADMIN_NEW_USER_REGISTERED:', err));
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error during registration",
    });
  }
};

// Complete Registration (called after 3DS)
export const completeRegistration = async (req, res) => {
  try {
    const { registrationToken, setupIntentId } = req.body;

    if (!registrationToken) {
      return res.status(400).json({
        success: false,
        message: "Registration token required",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(registrationToken, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired registration token",
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Already completed — just issue tokens
    if (user.isPaymentVerified) {
      return generateTokensAndRespond(
        user,
        req,
        res,
        "Registration already complete"
      );
    }

    const intentId = setupIntentId || user.pendingSetupIntentId;
    if (!intentId) {
      return res.status(400).json({
        success: false,
        message: "No pending SetupIntent found for this user",
      });
    }

    const setupIntent = await StripeService.retrieveSetupIntent(intentId);

    if (setupIntent.status !== "succeeded") {
      return res.status(400).json({
        success: false,
        message: `Card verification status: ${setupIntent.status}. Please try again.`,
      });
    }

    const pmId = setupIntent.payment_method;
    const paymentMethod = await stripe.paymentMethods.retrieve(pmId);

    await StripeService.setDefaultPaymentMethod(user.stripeCustomerId, pmId);

    user.paymentMethodId = pmId;
    user.cardLast4 = paymentMethod.card?.last4;
    user.cardBrand = paymentMethod.card?.brand;
    user.cardExpMonth = paymentMethod.card?.exp_month;
    user.cardExpYear = paymentMethod.card?.exp_year;
    user.isPaymentVerified = true;
    user.pendingSetupIntentId = undefined;
    await user.save();

    welcomeEmail(user).catch((err) =>
      console.error(`Failed to send welcome email to ${user?.email}:`, err)
    );
    const adminUsers = await User.find({ userType: "admin" });
    for (const admin of adminUsers) {
      newUserRegistrationEmail(admin.email, user).catch((err) =>
        console.error(`Failed to send new user admin email to ${admin.email}:`, err)
      );
    }

    notifyAdminsAndStaffWithPermission('ADMIN_NEW_USER_REGISTERED', {
      title: 'New user registered',
      message: `${user.firstName} ${user.lastName} — ${user.email}`,
      actionUrl: `/admin/users`,
      relatedEntity: { type: 'User', id: user._id },
      metadata: { userId: user._id, userType: user.userType, email: user.email },
    }).catch((err) => console.error('notify ADMIN_NEW_USER_REGISTERED (bidder):', err));

    await generateTokensAndRespond(user, req, res, "Registration successful");
  } catch (error) {
    console.error("Complete registration error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to complete registration",
    });
  }
};

// Login Controller
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "No user found",
      });
    }

    // Check if user is active
    // if (!user.isActive) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Account is deactivated",
    //   });
    // }

    // Verify password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Wrong password",
      });
    }

    // await generateTokensAndRespond(user, res, 'Login successful');
    await generateTokensAndRespond(user, req, res, "Login successful");
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during login",
    });
  }
};

// Logout Controller
export const logoutUser = async (req, res) => {
  try {
    const user = req.user;

    // Clear refresh token from database
    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });

    // Clear cookies
    res.clearCookie("accessToken").clearCookie("refreshToken").json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during logout",
    });
  }
};

// Refresh Access Token
export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Generate new tokens
    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    // Update refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    // ← FIX B: mirror the login behaviour — set httpOnly cookies too.
    // The frontend also stores tokens in localStorage (Bearer auth), so
    // this is a belt-and-braces addition that makes the cookies always
    // match the freshest tokens. Sockets and any cookie-authenticated
    // path now stay in sync across silent refreshes.
    res
      .status(200)
      .cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 60 * 1000, // 30 minutes
      })
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      })
      .json({
        success: true,
        message: "Access token refreshed",
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      });
  } catch (error) {
    console.error("Token refresh error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Refresh token expired",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error during token refresh",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account with that email exists, a reset link has been sent.",
      });
    }

    const resetToken = await user.generateResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const url = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const emailSent = await resetPasswordEmail(user.email, url);

    if (!emailSent) {
      user.resetPasswordToken = null;
      user.resetPasswordTokenExpiry = null;
      await user.save({ validateBeforeSave: false });
      return res
        .status(500)
        .json({ success: false, message: "Could not send email" });
    }

    return res.status(200).json({
      success: true,
      message:
        "If an account with that email exists, a reset link has been sent.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;

    const { newPassword } = req.body;

    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Token is required" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(200)
        .json({ success: true, message: "Token is invalid or has expired" });
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({ success: true, message: "Password updated" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to get user" });
  }
};

export const getBillingInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "stripeCustomerId paymentMethodId cardLast4 cardBrand cardExpMonth cardExpYear isPaymentVerified userType"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const billingInfo = {
      stripeCustomerId: user.stripeCustomerId,
      isPaymentVerified: user.isPaymentVerified,
      userType: user.userType,
    };

    // Add card details if available
    if (user.cardLast4) {
      billingInfo.card = {
        last4: user.cardLast4,
        brand: user.cardBrand,
        expMonth: user.cardExpMonth,
        expYear: user.cardExpYear,
      };
    }

    res.status(200).json({
      success: true,
      data: billingInfo,
    });
  } catch (error) {
    console.error("Get billing info error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching billing information",
    });
  }
};

export const createPaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId } = req.body;
    const userId = req.user._id;

    if (!paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: "Payment method ID is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user already has a Stripe customer
    if (user.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        message: "User already has a Stripe customer. Use update endpoint instead.",
      });
    }

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      metadata: {
        userId: user._id.toString(),
        userType: user.userType,
      },
    });

    // Attach payment method to customer
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    // Set as default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    });

    // Update user with card details
    user.stripeCustomerId = customer.id;
    user.paymentMethodId = paymentMethod.id;
    user.cardLast4 = paymentMethod.card.last4;
    user.cardBrand = paymentMethod.card.brand;
    user.cardExpMonth = paymentMethod.card.exp_month;
    user.cardExpYear = paymentMethod.card.exp_year;
    user.isPaymentVerified = true;

    await user.save();

    const cardInfo = {
      last4: user.cardLast4,
      brand: user.cardBrand,
      expMonth: user.cardExpMonth,
      expYear: user.cardExpYear,
    };

    res.status(201).json({
      success: true,
      message: "Payment method added successfully!",
      data: {
        card: cardInfo,
        isPaymentVerified: true,
        userType: user.userType,
        stripeCustomerId: user.stripeCustomerId,
      },
    });
  } catch (error) {
    console.error("Create payment method error:", error);

    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      return res.status(400).json({
        success: false,
        message: error.message || "Your card was declined. Please try a different card.",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to add payment method",
    });
  }
};

// -------- Step 1: Start card update (returns clientSecret for 3DS) --------
export const updatePaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId, cardSaveConsent } = req.body;
    const userId = req.user._id;

    if (!paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: "Payment method ID is required",
      });
    }

    const consentGiven =
      cardSaveConsent === "true" || cardSaveConsent === true;
    if (!consentGiven) {
      return res.status(400).json({
        success: false,
        message:
          "You must consent to card storage and off-session deposit charges",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Edge case: user has no Stripe customer yet (e.g. registered as seller)
    if (!user.stripeCustomerId) {
      const customer = await StripeService.createCustomer(
        user.email,
        `${user.firstName} ${user.lastName}`,
        { userId: user._id.toString(), userType: user.userType }
      );
      user.stripeCustomerId = customer.id;
      await user.save();
    }

    // Attach new PM to customer (required before SetupIntent can use it)
    await StripeService.attachPaymentMethod(
      user.stripeCustomerId,
      paymentMethodId
    );

    // Create UNCONFIRMED SetupIntent for verification + 3DS
    const setupIntent = await StripeService.createSetupIntent(
      user.stripeCustomerId,
      paymentMethodId,
      { userId: user._id.toString(), purpose: "card_update" }
    );

    // Record consent + remember the pending intent
    user.cardSaveConsentAt = new Date();
    user.cardSaveConsentIp =
      req.ip ||
      req.headers["x-forwarded-for"] ||
      req.socket?.remoteAddress;
    user.pendingSetupIntentId = setupIntent.id;
    await user.save();

    return res.status(200).json({
      success: true,
      requiresAction: true,
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
      message: "Please verify your card to complete the update",
    });
  } catch (error) {
    console.error("Update payment method error:", error);
    if (error.type === "StripeCardError") {
      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Your card was declined. Please try a different card.",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update payment method",
    });
  }
};

// -------- Step 2: Finalize after 3DS (or immediately if no 3DS) --------
export const completeCardUpdate = async (req, res) => {
  try {
    const { setupIntentId } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const intentId = setupIntentId || user.pendingSetupIntentId;
    if (!intentId) {
      return res.status(400).json({
        success: false,
        message: "No pending SetupIntent found for this user",
      });
    }

    const setupIntent = await StripeService.retrieveSetupIntent(intentId);

    if (setupIntent.status !== "succeeded") {
      return res.status(400).json({
        success: false,
        message: `Card verification status: ${setupIntent.status}. Please try again.`,
      });
    }

    const pmId = setupIntent.payment_method;

    // ---- Cancel PENDING authorizations on old card ----
    const pendingAuthorizations = await BidPayment.find({
      bidder: userId,
      type: "bid_authorization",
      status: "requires_capture",
    });

    let cancelledCount = 0;
    for (const payment of pendingAuthorizations) {
      try {
        await StripeService.cancelPaymentIntent(payment.paymentIntentId);
        payment.status = "canceled";
        await payment.save();
        cancelledCount++;
      } catch (error) {
        console.error(
          `Failed to cancel authorization ${payment.paymentIntentId}:`,
          error.message
        );
      }
    }

    // ---- Mark succeeded authorizations as replaced ----
    await BidPayment.updateMany(
      { bidder: userId, type: "bid_authorization", status: "succeeded" },
      { status: "replaced" }
    );

    // ---- Make new PM the default ----
    await StripeService.setDefaultPaymentMethod(
      user.stripeCustomerId,
      pmId
    );

    const paymentMethod = await stripe.paymentMethods.retrieve(pmId);

    user.paymentMethodId = pmId;
    user.cardLast4 = paymentMethod.card?.last4;
    user.cardBrand = paymentMethod.card?.brand;
    user.cardExpMonth = paymentMethod.card?.exp_month;
    user.cardExpYear = paymentMethod.card?.exp_year;
    user.isPaymentVerified = true;
    user.pendingSetupIntentId = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Payment method updated successfully. ${cancelledCount} pending authorizations cancelled.`,
      data: {
        card: {
          last4: user.cardLast4,
          brand: user.cardBrand,
          expMonth: user.cardExpMonth,
          expYear: user.cardExpYear,
        },
        isPaymentVerified: true,
        userType: user.userType,
        stripeCustomerId: user.stripeCustomerId,
        cancelledAuthorizations: cancelledCount,
      },
    });
  } catch (error) {
    console.error("Complete card update error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to complete card update",
    });
  }
};

// Upload identification document
export const uploadIdentification = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only JPG, PNG, and PDF are allowed",
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user can upload (only if rejected or not verified)
    if (user.identificationStatus === "verified") {
      return res.status(400).json({
        success: false,
        message: "Your identity is already verified",
      });
    }

    // If user had previous document, delete it from Cloudinary
    if (user.identificationDocumentPublicId) {
      try {
        await deleteFromCloudinary(user.identificationDocumentPublicId, "raw");
      } catch (deleteError) {
        console.error("Failed to delete old document:", deleteError);
        // Continue with upload even if delete fails
      }
    }

    // Upload new document to Cloudinary
    const isImage = file.mimetype.startsWith("image/");
    let uploadResult;

    if (isImage) {
      uploadResult = await uploadImageToCloudinary(
        file.buffer,
        "identification-documents",
      );
    } else {
      uploadResult = await uploadDocumentToCloudinary(
        file.buffer,
        file.originalname,
        "identification-documents",
      );
    }

    // Update user with new document info
    user.identificationDocument = uploadResult.secure_url;
    user.identificationDocumentPublicId = uploadResult.public_id;
    user.identificationStatus = "pending";
    user.identificationRejectionReason = null; // Clear any previous rejection reason
    user.identificationVerifiedAt = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Identification document uploaded successfully",
      data: {
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    console.error("Upload identification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload identification document",
    });
  }
};

// Get user's verification status
export const getVerificationStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select(
      "identificationDocument identificationStatus identificationVerifiedAt identificationRejectionReason",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        status: user.identificationStatus || "not_uploaded",
        documentUrl: user.identificationDocument,
        verifiedAt: user.identificationVerifiedAt,
        rejectionReason: user.identificationRejectionReason,
      },
    });
  } catch (error) {
    console.error("Get verification status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch verification status",
    });
  }
};

// Delete identification document
export const deleteIdentification = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Only allow deletion if status is rejected or pending
    if (user.identificationStatus === "verified") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete verified document",
      });
    }

    // Delete from Cloudinary
    if (user.identificationDocumentPublicId) {
      try {
        await deleteFromCloudinary(user.identificationDocumentPublicId, "raw");
      } catch (deleteError) {
        console.error("Failed to delete from Cloudinary:", deleteError);
      }
    }

    // Clear document fields
    user.identificationDocument = null;
    user.identificationDocumentPublicId = null;
    user.identificationStatus = null;
    user.identificationRejectionReason = null;
    user.identificationVerifiedAt = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Identification document deleted successfully",
      data: {
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    console.error("Delete identification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete identification document",
    });
  }
};