import crypto  from "crypto";

export const getFileHash = (fileBuffer) => {
  return crypto.createHash("md5").update(fileBuffer).digest("hex");
};
