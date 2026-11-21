// Adjust these import paths if your models are in a different folder
import Auction from '../models/auction.model.js';
import Event from '../models/event.model.js';

export async function getSitemapUrls() {
  try {
    // 1. Define your static routes (pages that never change)
    const staticRoutes = [
      '/', '/about', '/events', '/auctions', '/liquidate',
      '/sell-with-us', '/contact', '/faqs', '/privacy-policy',
      '/terms-of-use', '/buyer-agreement', '/seller-agreement',
      '/real-estate-faqs', '/sell-property', '/register', '/login'
    ];

    // 2. Fetch dynamic Auctions from the database
    // We only want active, sold, or ended auctions. We exclude 'draft' and 'cancelled'.
    const auctions = await Auction.find({
      status: { $nin: ['draft', 'cancelled'] }
    }).select('_id updatedAt'); // Only fetch the ID and updated date to keep it fast

    // 3. Fetch dynamic Events from the database
    // We only want published or completed events.
    const events = await Event.find({
      status: { $in: ['published', 'completed'] }
    }).select('_id updatedAt');

    // 4. Format Auctions for the Sitemap
    const auctionUrls = auctions.map((auction) => ({
      url: `/auction/${auction._id.toString()}`,
      // Format date as YYYY-MM-DD (required by Google)
      lastmod: auction.updatedAt ? auction.updatedAt.toISOString().split('T')[0] : undefined,
      changefreq: 'weekly',
      priority: 0.8
    }));

    // 5. Format Events for the Sitemap
    const eventUrls = events.map((event) => ({
      url: `/event/${event._id.toString()}`,
      lastmod: event.updatedAt ? event.updatedAt.toISOString().split('T')[0] : undefined,
      changefreq: 'weekly',
      priority: 0.8
    }));

    // 6. Combine everything and return
    return [
      ...staticRoutes.map(path => ({ url: path })),
      ...auctionUrls,
      ...eventUrls
    ];

  } catch (error) {
    console.error("❌ Error generating sitemap URLs:", error);
    // If the database fails, at least return the static pages so the sitemap doesn't break
    return ['/']; 
  }
}