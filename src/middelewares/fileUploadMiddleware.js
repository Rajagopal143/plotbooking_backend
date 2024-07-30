import multer from "multer";

const storage = multer.memoryStorage()
const upload = multer({ storage });

export default upload.array('files', 2)

const singleStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const singleUpload = multer({ storage: storage });

export const singlefile = singleUpload.single("file");