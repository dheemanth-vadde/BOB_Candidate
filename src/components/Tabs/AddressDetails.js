// components/Tabs/AddressDetails.jsx
import React, { useState } from "react";

const AddressDetails = ({ goNext, goBack }) => {
	const [corrAddress, setCorrAddress] = useState({
  line1: "",
  line2: "",
  city: "",
  district: "",
	state: "",
  pincode: ""
});

const [permAddress, setPermAddress] = useState({
  line1: "",
  line2: "",
  city: "",
  district: "",
	state: "",
  pincode: ""
});

const [sameAsCorrespondence, setSameAsCorrespondence] = useState(false);

	const handleSubmit = (e) => {
    e.preventDefault();
    goNext();   // Move to next step
  };

	const handleCorrChange = (e) => {
		const { id, value } = e.target;
		setCorrAddress(prev => ({ ...prev, [id]: value }));

		if (sameAsCorrespondence) {
			setPermAddress(prev => ({ ...prev, [id]: value }));
		}
	};

	const handlePermChange = (e) => {
		const { id, value } = e.target;
		setPermAddress(prev => ({ ...prev, [id]: value }));
	};

	const handleCheckboxToggle = (e) => {
		const checked = e.target.checked;
		setSameAsCorrespondence(checked);

		if (checked) {
			// copy values
			setPermAddress({ ...corrAddress });
		}
	};

  return (
    <div className="px-4 py-3 border rounded bg-white">
			<form className="row g-4 formfields"
				onSubmit={handleSubmit}
				// onInvalid={handleInvalid}
				// onInput={handleInput}
			>
				<p className="tab_headers" style={{ marginBottom: '0px' }}>Address of Correspondence</p>
				
				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="line1" className="form-label">Address Line 1 <span className="text-danger">*</span></label>
					<input type="text" className="form-control" id="line1" value={corrAddress.line1} onChange={handleCorrChange} />
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="line2" className="form-label">Address Line 2 <span className="text-danger">*</span></label>
					<input type="text" className="form-control" id="line2" value={corrAddress.line2} onChange={handleCorrChange} />
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="city" className="form-label">City <span className="text-danger">*</span></label>
					<select
						className="form-select"
						id="city"
						// value={formData.gender}
						// onChange={handleChange}
						value={corrAddress.city}
						onChange={handleCorrChange}
					>
						<option value="Hyderabad">Hyderabad</option>
						<option value="Vizag">Vizag</option>
						<option value="Vijayawada">Vijayawada</option>
					</select>
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="district" className="form-label">District <span className="text-danger">*</span></label>
					<select
						className="form-select"
						id="district"
						// value={formData.gender}
						// onChange={handleChange}
						value={corrAddress.district}
						onChange={handleCorrChange}
					>
						<option value="Ranga Reddy">Ranga Reddy</option>
						<option value="Medak">Medak</option>
						<option value="Kurnool">Kurnool</option>
					</select>
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="state" className="form-label">State <span className="text-danger">*</span></label>
					<select
						className="form-select"
						id="state"
						// value={formData.gender}
						// onChange={handleChange}
						value={corrAddress.state}
						onChange={handleCorrChange}
					>
						<option value="Telangana">Telangana</option>
						<option value="Andhra Pradesh">Andhra Pradesh</option>
						<option value="Gujarat">Gujarat</option>
					</select>
				</div>
				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="pincode" className="form-label">Pin <span className="text-danger">*</span></label>
					<select
						className="form-select"
						id="pincode"
						// value={formData.gender}
						// onChange={handleChange}
						value={corrAddress.pincode}
						onChange={handleCorrChange}
					>
						<option value="500033">500033</option>
						<option value="500034">500034</option>
						<option value="500080">500080</option>
					</select>
				</div>

				<div className="col-md-12 col-sm-12 mt-3 d-flex align-items-center gap-2 pb-3 border-bottom">
					<input
						type="checkbox"
						// className="form-control"
						id="sameCheckbox"
						// value={formData.education_qualification || ''}
						// onChange={handleChange}
						checked={sameAsCorrespondence}
  					onChange={handleCheckboxToggle}
					/>
					<label htmlFor="sameCheckbox" className="form-label mb-0">Same as Address of Correspondence</label>
				</div>

				<p className="tab_headers mt-3" style={{ marginBottom: '0px' }}>Permanent Address</p>
				
				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="line1" className="form-label">Address Line 1 <span className="text-danger">*</span></label>
					<input type="text" className="form-control" id="line1" value={permAddress.line1} onChange={handlePermChange} disabled={sameAsCorrespondence} />
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="line2" className="form-label">Address Line 2 <span className="text-danger">*</span></label>
					<input type="text" className="form-control" id="line2" value={permAddress.line2} onChange={handlePermChange} disabled={sameAsCorrespondence} />
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="city" className="form-label">City <span className="text-danger">*</span></label>
					<select
						className="form-select"
						id="city"
						// value={formData.gender}
						// onChange={handleChange}
						value={permAddress.city}
						onChange={handlePermChange}
						disabled={sameAsCorrespondence}
					>
						<option value="Hyderabad">Hyderabad</option>
						<option value="Vizag">Vizag</option>
						<option value="Vijayawada">Vijayawada</option>
					</select>
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="district" className="form-label">District <span className="text-danger">*</span></label>
					<select
						className="form-select"
						id="district"
						// value={formData.gender}
						// onChange={handleChange}
						value={permAddress.district}
						onChange={handlePermChange}
						disabled={sameAsCorrespondence}
					>
						<option value="Ranga Reddy">Ranga Reddy</option>
						<option value="Medak">Medak</option>
						<option value="Kurnool">Kurnool</option>
					</select>
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="state" className="form-label">State <span className="text-danger">*</span></label>
					<select
						className="form-select"
						id="state"
						// value={formData.gender}
						// onChange={handleChange}
						value={permAddress.state}
						onChange={handlePermChange}
						disabled={sameAsCorrespondence}
					>
						<option value="Telangana">Telangana</option>
						<option value="Andhra Pradesh">Andhra Pradesh</option>
						<option value="Gujarat">Gujarat</option>
					</select>
				</div>
				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="pincode" className="form-label">Pin <span className="text-danger">*</span></label>
					<select
						className="form-select"
						id="pincode"
						// value={formData.gender}
						// onChange={handleChange}
						value={permAddress.pincode}
						onChange={handlePermChange}
						disabled={sameAsCorrespondence}
					>
						<option value="500033">500033</option>
						<option value="500034">500034</option>
						<option value="500080">500080</option>
					</select>
				</div>

				<div className="d-flex justify-content-between">
					<div>
						<button type="button" className="btn btn-outline-secondary" onClick={goBack}>Back</button>
					</div>
					<div>
						<button
							type="submit"
							className="btn btn-primary"
							style={{
								backgroundColor: "#ff7043",
								border: "none",
								padding: "8px 24px",
								borderRadius: "4px",
								color: "#fff"
							}}
						>Save and Next</button>
					</div>
				</div>

			</form>
    </div>
  );
};

export default AddressDetails;
