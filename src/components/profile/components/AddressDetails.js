// components/Tabs/AddressDetails.jsx
import React, { useEffect, useState } from "react";
import { mapAddressApiToForm, mapAddressFormToApi } from "../mappers/AddressMapper";
import masterApi from "../../../services/master.api";
import { useSelector } from "react-redux";
import profileApi from "../services/profile.api";
import { toast } from "react-toastify";
import { validateNonEmptyText } from "../../../shared/utils/validation";

const AddressDetails = ({ goNext, goBack }) => {
	const user = useSelector((state) => state?.user?.user?.data);
  const candidateId = user?.user?.id;
	// const candidateId = "70721aa9-0b00-4f34-bea2-3bf268f1c212";
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
	const [masters, setMasters] = useState({
		states: [],
		districts: [],
		cities: [],
		pincodes: []
	});

	useEffect(() => {
		async function loadMasters() {
			const res = await masterApi.getMasterData();
			const data = res?.data?.data;
			console.log("Master Data loaded:", data);
			setMasters({
				states: data.states || [],
				districts: data.districts || [],
				cities: data.cities || [],
				pincodes: data.pincodes || []
			});
		}
		loadMasters();
	}, []);

	const filteredDistricts = masters.districts.filter(
		d => d.stateId === corrAddress.state
	);

	const filteredCities = masters.cities.filter(
		c => c.districtId === corrAddress.district
	);

	const filteredPincodes = masters.pincodes.filter(
		p => p.cityId === corrAddress.city
	);

	const permFilteredDistricts = masters.districts.filter(
		d => d.stateId === permAddress.state
	);

	const permFilteredCities = masters.cities.filter(
		c => c.districtId === permAddress.district
	);

	const permFilteredPincodes = masters.pincodes.filter(
		p => p.cityId === permAddress.city
	);

	const fetchAddressDetails = async (candidateId) => {
		if (!candidateId) return;
		try {
			const res = await profileApi.getAddressDetails(candidateId);
			const apiData = res?.data?.data;
			console.log("Fetched Address Details:", apiData);
			if (!apiData) return;
			const mapped = mapAddressApiToForm(apiData);
			setCorrAddress(mapped.corrAddress);
			setPermAddress(mapped.permAddress);
			setSameAsCorrespondence(mapped.sameAsCorrespondence);
		} catch (error) {
			console.error("Error fetching address details:", error);
		}
	};

	useEffect(() => {
		if (!candidateId) return;
		fetchAddressDetails(candidateId);
	}, [candidateId]);

	useEffect(() => {
		if (sameAsCorrespondence) {
			setPermAddress({ ...corrAddress });
		}
	}, [sameAsCorrespondence]);

	const handleCorrChange = (e) => {
		const { id, value } = e.target;

		setCorrAddress(prev => {
			let updated = { ...prev, [id]: value };

			if (id === "state") {
				updated.district = "";
				updated.city = "";
				updated.pincode = "";
			}

			if (id === "district") {
				updated.city = "";
				updated.pincode = "";
			}

			if (id === "city") {
				updated.pincode = "";
			}

			return updated;
		});

		if (sameAsCorrespondence) {
			setPermAddress(prev => ({ ...prev, [id]: value }));
		}
	};

	const handlePermChange = (e) => {
		const { id, value } = e.target;

		setPermAddress(prev => {
			let updated = { ...prev, [id]: value };

			if (id === "state") {
				updated.district = "";
				updated.city = "";
				updated.pincode = "";
			}

			if (id === "district") {
				updated.city = "";
				updated.pincode = "";
			}

			if (id === "city") {
				updated.pincode = "";
			}

			return updated;
		});
	};

	const handleSubmit = async (e) => {
    e.preventDefault();

		const corrTextFields = [
			{ value: corrAddress.line1, label: "Correspondence Address Line 1" },
			{ value: corrAddress.line2, label: "Correspondence Address Line 2" },
		];

		for (const field of corrTextFields) {
			const { isValid, error } = validateNonEmptyText(field.value, field.label);
			if (!isValid) {
				toast.error(error);
				return;
			}
		}

		if (!sameAsCorrespondence) {
			const permTextFields = [
				{ value: permAddress.line1, label: "Permanent Address Line 1" },
				{ value: permAddress.line2, label: "Permanent Address Line 2" },
			];

			for (const field of permTextFields) {
				const { isValid, error } = validateNonEmptyText(field.value, field.label);
				if (!isValid) {
					toast.error(error);
					return;
				}
			}
		}

		try {
			const payload = mapAddressFormToApi({
				corrAddress,
				permAddress,
				sameAsCorrespondence,
				candidateId,
			});
			await profileApi.postAddressDetails(candidateId, payload);
			toast.success("Address details have been saved successfully");
			goNext();
		} catch (err) {
			console.error(err);
			toast.error("Failed to save address details");
		}
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
					<input type="text" className="form-control" id="line1" value={corrAddress.line1} onChange={handleCorrChange} required />
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="line2" className="form-label">Address Line 2 <span className="text-danger">*</span></label>
					<input type="text" className="form-control" id="line2" value={corrAddress.line2} onChange={handleCorrChange} required />
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="state" className="form-label">State <span className="text-danger">*</span></label>
					<select id="state" className="form-select"
						value={corrAddress.state}
						onChange={handleCorrChange}
						required
					>
						<option value="">Select State</option>
						{masters?.states.map(s => (
							<option key={s?.stateId} value={s?.stateId}>
								{s?.stateName}
							</option>
						))}
					</select>
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="district" className="form-label">District <span className="text-danger">*</span></label>
					<select id="district" className="form-select"
						value={corrAddress.district}
						onChange={handleCorrChange}
						disabled={!corrAddress.state}
						required
					>
						<option value="">Select District</option>
						{filteredDistricts.map(d => (
							<option key={d.districtId} value={d.districtId}>
								{d.districtName}
							</option>
						))}
					</select>
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="city" className="form-label">City <span className="text-danger">*</span></label>
					<select id="city" className="form-select"
						value={corrAddress.city}
						onChange={handleCorrChange}
						disabled={!corrAddress.district}
						required
					>
						<option value="">Select City</option>
						{filteredCities.map(c => (
							<option key={c.cityId} value={c.cityId}>
								{c.cityName}
							</option>
						))}
					</select>
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="pincode" className="form-label">Pin <span className="text-danger">*</span></label>
					<select id="pincode" className="form-select"
						value={corrAddress.pincode}
						onChange={handleCorrChange}
						disabled={!corrAddress.city}
						required
					>
						<option value="">Select Pincode</option>
						{filteredPincodes.map(p => (
							<option key={p.pincodeId} value={p.pincodeId}>
								{p.pin}
							</option>
						))}
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
					<input type="text" className="form-control" id="line1" value={permAddress.line1} onChange={handlePermChange} required disabled={sameAsCorrespondence} />
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="line2" className="form-label">Address Line 2 <span className="text-danger">*</span></label>
					<input type="text" className="form-control" id="line2" value={permAddress.line2} onChange={handlePermChange} required disabled={sameAsCorrespondence} />
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="state" className="form-label">State <span className="text-danger">*</span></label>
					<select
						className="form-select"
						id="state"
						value={permAddress.state}
						onChange={handlePermChange}
						disabled={sameAsCorrespondence}
						required
					>
						<option value="">Select State</option>
						{masters.states.map(s => (
							<option key={s.stateId} value={s.stateId}>
								{s.stateName}
							</option>
						))}
					</select>
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="district" className="form-label">District <span className="text-danger">*</span></label>
					<select
						className="form-select"
						id="district"
						value={permAddress.district}
						onChange={handlePermChange}
						disabled={sameAsCorrespondence || !permAddress.state}
						required
					>
						<option value="">Select District</option>
						{permFilteredDistricts.map(d => (
							<option key={d.districtId} value={d.districtId}>
								{d.districtName}
							</option>
						))}
					</select>
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="city" className="form-label">City <span className="text-danger">*</span></label>
					<select
						className="form-select"
						id="city"
						value={permAddress.city}
						onChange={handlePermChange}
						disabled={sameAsCorrespondence || !permAddress.district}
						required
					>
						<option value="">Select City</option>
						{permFilteredCities.map(c => (
							<option key={c.cityId} value={c.cityId}>
								{c.cityName}
							</option>
						))}
					</select>
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="pincode" className="form-label">Pin <span className="text-danger">*</span></label>
					<select
						className="form-select"
						id="pincode"
						value={permAddress.pincode}
						onChange={handlePermChange}
						disabled={sameAsCorrespondence || !permAddress.city}
						required
					>
						<option value="">Select Pincode</option>
						{permFilteredPincodes.map(p => (
							<option key={p.pincodeId} value={p.pincodeId}>
								{p.pin}
							</option>
						))}
					</select>
				</div>

				<div className="d-flex justify-content-between">
					<div>
						<button type="button" className="btn btn-outline-secondary text-muted" onClick={goBack}>Back</button>
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
