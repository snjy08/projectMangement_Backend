const multer = require('multer');

// Multer configuration for member picture uploads
const memberPictureUpload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/memberPictures'); // Adjust destination folder as needed
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + '-' + file.originalname);
        }
    }),
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'));
        }
        cb(null, true);
    }
}).single('memberPictures'); // Assuming you're uploading one picture per member

module.exports = { memberPictureUpload };
