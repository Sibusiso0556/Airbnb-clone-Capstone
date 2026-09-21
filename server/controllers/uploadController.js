function fileUrl(file) {
  
  if (file.path && /^https?:\/\//.test(file.path)) {
    return file.path;
  }
  return `/uploads/${file.filename}`;
}

function uploadImages(req, res) {
  const files = req.files || (req.file ? [req.file] : []);
  if (!files.length) {
    return res.status(400).json({ message: 'No image files were uploaded.' });
  }
  const urls = files.map(fileUrl);
  res.status(201).json({ urls });
}

module.exports = { uploadImages };
