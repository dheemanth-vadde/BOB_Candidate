import React, { forwardRef } from "react";
import PreviewModal from "../components/PreviewModal";
// ⬆️ Extract ONLY preview body JSX into this component

const ApplicationPreviewRenderer = forwardRef(
  ({ previewData, selectedJob, masterData }, ref) => {
    if (!previewData) return null;

    return (
      <div
        ref={ref}
        style={{
          position: "fixed",
          top: "-9999px",
          left: "-9999px",
          width: "800px",
          background: "#fff"
        }}
      >
        <PreviewModal
          previewData={previewData}
          selectedJob={selectedJob}
          masterData={masterData}
        />
      </div>
    );
  }
);

export default ApplicationPreviewRenderer;
