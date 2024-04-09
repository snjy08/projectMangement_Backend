const SocialMedia = require('../model/socialMediaSchema'); // Import the SocialMedia model

exports.getOverallSocialNetworkingData = async (req, res) => {
    try {
        const currentDate = new Date();
        const lastTwoYearsStartDate = new Date(currentDate.getFullYear() - 2, 0, 1); // Start of two years ago
        const lastTwoYearsEndDate = new Date(currentDate.getFullYear() - 1, 11, 31); // End of last year

        const lastTwoYearsStats = await SocialMedia.aggregate([
            {
                $match: {
                    timestamp: { $gte: lastTwoYearsStartDate, $lte: lastTwoYearsEndDate }
                }
            },
            {
                $group: {
                    _id: '$platformName',
                    totalFollowersCount: { $sum: '$followersCount' }
                }
            }
        ]);
        console.log(lastTwoYearsEndDate, lastTwoYearsStartDate, lastTwoYearsStats)
        const pastTwoYearsStartDate = new Date(currentDate.getFullYear() - 3, 0, 1); // Start of three years ago
        const pastTwoYearsStats = await SocialMedia.aggregate([
            {
                $match: {
                    timestamp: { $gte: new Date(0), $lt: lastTwoYearsStartDate } // Before last two years
                }
            },
            {
                $group: {
                    _id: '$platformName',
                    totalFollowersCount: { $sum: '$followersCount' }
                }
            }
        ]);
        console.log(pastTwoYearsStartDate, pastTwoYearsStats)
        const socialMediaStats = {};
        lastTwoYearsStats.forEach(stat => {
            socialMediaStats[stat._id] = {
                followersCount: stat.totalFollowersCount
            };
        });

        pastTwoYearsStats.forEach(stat => {
            if (socialMediaStats[stat._id]) {
                const percentageChange = ((socialMediaStats[stat._id].followersCount - stat.totalFollowersCount) / stat.totalFollowersCount) * 100;
                socialMediaStats[stat._id].percentageChange = percentageChange.toFixed(2); // Round to 2 decimal places
            }
        });

        res.status(200).json(socialMediaStats);
    } catch (error) {
        console.error('Error getting social media stats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



// Controller function to create a new social media post/activity
exports.createSocialMediaPost = async (req, res) => {
    try {
        const { platformName, followersCount, postId } = req.body;
 
        const newSocialMediaPost = new SocialMedia({
            platformName,
            followersCount,
            postId
        });

        
        await newSocialMediaPost.save();

       
        res.status(201).json({ message: 'Social media post created successfully' });
    } catch (error) {
        console.error('Error creating social media post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getLastTwoYearsData = async (req,res) => {
    const currentDate = new Date();
    const lastTwoYearsStartDate = new Date(currentDate.getFullYear() - 2, currentDate.getMonth(), currentDate.getDate());
    const lastTwoYearsEndDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
    const previousTwoYearsStartDate = new Date(currentDate.getFullYear() - 4, currentDate.getMonth(), currentDate.getDate());
    const previousTwoYearsEndDate = new Date(currentDate.getFullYear() - 3, currentDate.getMonth(), currentDate.getDate());

    try {
        const lastTwoYearsFollowers = await SocialMedia.aggregate([
            {
                $match: {
                    timestamp: { $gte: lastTwoYearsStartDate, $lte: lastTwoYearsEndDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalFollowers: { $sum: "$followersCount" }
                }
            }
        ]);

        const previousTwoYearsFollowers = await SocialMedia.aggregate([
            {
                $match: {
                    timestamp: { $gte: previousTwoYearsStartDate, $lte: previousTwoYearsEndDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalFollowers: { $sum: "$followersCount" }
                }
            }
        ]);

        let percentageChange = 0;
        if (previousTwoYearsFollowers.length > 0 && lastTwoYearsFollowers.length > 0) {
            const previousFollowers = previousTwoYearsFollowers[0].totalFollowers;
            const currentFollowers = lastTwoYearsFollowers[0].totalFollowers;
            percentageChange = ((currentFollowers - previousFollowers) / previousFollowers) * 100;
        }

        res.status(200).json({
            lastTwoYearsFollowers: lastTwoYearsFollowers.length > 0 ? lastTwoYearsFollowers[0].totalFollowers : 0,
            previousTwoYearsFollowers: previousTwoYearsFollowers.length > 0 ? previousTwoYearsFollowers[0].totalFollowers : 0,
            percentageChange: percentageChange.toFixed(2) // Limit to 2 decimal places
        })
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

