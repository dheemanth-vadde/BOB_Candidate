import { toast } from "react-toastify";
import masterApi from "../../services/master.api";

/**
 * Downloads a file from backend using file URL
 * @param {string} fileUrl - Azure blob file path
 */
// export const handleEyeClick = async (fileUrl) => {
//   if (!fileUrl) {
//     toast.error("No document available");
//     return;
//   }

//   try {
//     const res = await masterApi.downloadFile(fileUrl);

//     const blob = new Blob([res.data], {
//       type: res.headers?.["content-type"] || "application/octet-stream",
//     });

//     const url = window.URL.createObjectURL(blob);

//     // ✅ Extract filename from path
//     const fileName = fileUrl.split("/").pop() || "document";

//     const link = document.createElement("a");
//     link.href = url;
//     link.download = fileName;
//     document.body.appendChild(link);
//     link.click();

//     link.remove();
//     window.URL.revokeObjectURL(url);
//   } catch (error) {
//     console.error("File download error:", error);
//     toast.error("Download failed");
//   }
// };


export const handleEyeClick = async (filePath) => {
  if (!filePath) {
    toast.error("No document available");
    return;
  }

  try {
    const res = await masterApi.getSasUrl(filePath);
    console.log("view res",res);
    const cleanUrl = res.data ? res?.data?.replace(/\s+/g, "") : res?.replace(/\s+/g, "");

    if (!cleanUrl) {
      toast.error("Invalid document URL");
      return;
    }
    // res.data is already a downloadable URL
    window.open(cleanUrl, "_blank", "noopener,noreferrer");
  } catch (error) {
    console.error(error);
    toast.error("Unable to open document");
  }
};
