import React, { useRef, useState } from 'react'
import UploadField from '../../../shared/components/UploadField';

const uploadFieldsConfig = [
  { key: "photo", label: "Photo", required: true },
  { key: "signature", label: "Signature", required: true },
  { key: "idProof", label: "ID Proof", required: true },
  { key: "salary1", label: "Last 3 Month Salary Slip - Month 1", required: true },
  { key: "salary2", label: "Last 3 Month Salary Slip - Month 2", required: true },
  { key: "salary3", label: "Last 3 Month Salary Slip - Month 3", required: true },
	{ key: "other", label: "Others - Name", required: false, customName: true }
];

const DocumentDetails = ({ goNext, goBack }) => {
  const [files, setFiles] = useState({});
	const [customNames, setCustomNames] = useState({});
  const fileInputRefs = useRef({});

  const handleBrowse = (key) => {
    fileInputRefs.current[key].click();
  };

  const handleFileChange = (key, e) => {
    const file = e.target.files[0];
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

	const handleCustomName = (key, value) => {
    setCustomNames((prev) => ({ ...prev, [key]: value }));
  };

	const handleSubmit = (e) => {
    e.preventDefault();
    goNext();   // Move to next step
  };

  return (
		<div className="px-4 py-3 border rounded bg-white">
			<div className="row g-5 mt-0">
				{uploadFieldsConfig.map((field) => (
					<UploadField
						key={field.key}
						label={field.label}
						required={field.required}
						file={files[field.key]}
						customName={field.customName}
						customNameValue={customNames[field.key]}
						onCustomNameChange={(value) => handleCustomName(field.key, value)}
						onBrowse={() => handleBrowse(field.key)}
						onChange={(e) => handleFileChange(field.key, e)}
						ref={(el) => (fileInputRefs.current[field.key] = el)}
					/>
				))}

				<div className="d-flex justify-content-between">
						<div>
							<button type="button" className="btn btn-outline-secondary" onClick={goBack}>Back</button>
						</div>
						<div>
							<button
								type="button"
								className="btn btn-primary"
								style={{
									backgroundColor: "#ff7043",
									border: "none",
									padding: "8px 24px",
									borderRadius: "4px",
									color: "#fff"
								}}
								onClick={handleSubmit}
							>Submit</button>
						</div>
				</div>
			</div>
		</div>
  );
}

export default DocumentDetails