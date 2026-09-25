const Event = require('../models/Event');
const Gallery = require('../models/Gallery');
const Volunteer = require('../models/Volunteer');
const Contact = require('../models/Contact');
const Team = require('../models/Team');

/**
 * GET /api/admin/dashboard/stats
 * Protected admin dashboard stats endpoint.
 * Returns summary counts and recent activities across collections.
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      eventsTotal,
      eventsPublished,
      galleryAlbums,
      volunteersTotal,
      contactMessages,
      activeTeamMembers,
      recentEvents,
      recentVolunteers,
      recentMessages,
    ] = await Promise.all([
      Event.countDocuments(),
      Event.countDocuments({ status: 'published' }),
      Gallery.countDocuments(),
      Volunteer.countDocuments(),
      Contact.countDocuments(),
      Team.countDocuments({ active: true }),
      Event.find()
        .select('title date status createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Volunteer.find()
        .select('name email volunteerArea status createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Contact.find()
        .select('name email subject status createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        eventsTotal,
        eventsPublished,
        galleryAlbums,
        volunteersTotal,
        contactMessages,
        activeTeamMembers,
        recentActivity: {
          events: recentEvents,
          volunteers: recentVolunteers,
          messages: recentMessages,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics',
    });
  }
};
