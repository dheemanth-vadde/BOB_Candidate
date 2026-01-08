// components/Tabs/AddressDetails.jsx
import React, { useEffect, useState } from "react";
import { mapAddressApiToForm, mapAddressFormToApi } from "../mappers/AddressMapper";
import masterApi from "../../../services/master.api";
import { useSelector } from "react-redux";
import profileApi from "../services/profile.api";
import { toast } from "react-toastify";
import { validateNonEmptyText } from "../../../shared/utils/validation";
import BackButtonWithConfirmation from "../../../shared/components/BackButtonWithConfirmation";

const AddressDetails = ({ goNext, goBack }) => {
	const user = useSelector((state) => state?.user?.user?.data);
	const [formErrors, setFormErrors] = useState({
    corrAddress: {},
    permAddress: {}
  });

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
	const [isDirty, setIsDirty] = useState(false);
	const [masters, setMasters] = useState({
		states: [],
		districts: [],
		cities: [],
		pincodes: []
	});
	const EMPTY_ADDRESS = {
		line1: "",
		line2: "",
		city: "",
		district: "",
		state: "",
		pincode: ""
	};

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
			const apiData = res?.data;
			console.log("Fetched Address Details:", apiData);
			if (!apiData) return;
			const mapped = mapAddressApiToForm(apiData);
			setCorrAddress(mapped.corrAddress);
			setPermAddress(mapped.permAddress);
			setSameAsCorrespondence(mapped.sameAsCorrespondence);
			setIsDirty(false);
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

	const trimAddress = (address) => ({
		...address,
		line1: address.line1.trim(),
		line2: address.line2.trim(),
	});

	const handleCorrChange = (e) => {
		const { id, value } = e.target;

		// Clear the error for the current field
		setFormErrors(prev => ({
			...prev,
			corrAddress: {
				...prev.corrAddress,
				[id]: undefined
			}
		}));

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
		setIsDirty(true);

		if (sameAsCorrespondence) {
			setPermAddress(prev => ({ ...prev, [id]: value }));
		}
	};

	const handlePermChange = (e) => {
		const { id, value } = e.target;

		// Clear the error for the current field
		setFormErrors(prev => ({
			...prev,
			permAddress: {
				...prev.permAddress,
				[id]: undefined
			}
		}));

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
		setIsDirty(true);
	};

	const validateForm = () => {
    let isValid = true;
    const newErrors = {
      corrAddress: {},
      permAddress: {}
    };

    // Validate Correspondence Address
    if (!corrAddress.line1.trim()) {
      newErrors.corrAddress.line1 = 'This field is required';
      isValid = false;
    }
    if (!corrAddress.line2.trim()) {
      newErrors.corrAddress.line2 = 'This field is required';
      isValid = false;
    }
    if (!corrAddress.state) {
      newErrors.corrAddress.state = 'This field is required';
      isValid = false;
    }
    if (!corrAddress.district) {
      newErrors.corrAddress.district = 'This field is required';
      isValid = false;
    }
    if (!corrAddress.city) {
      newErrors.corrAddress.city = 'This field is required';
      isValid = false;
    }
    if (!corrAddress.pincode) {
      newErrors.corrAddress.pincode = 'This field is required';
      isValid = false;
    }

    // Validate Permanent Address if different from correspondence
    if (!sameAsCorrespondence) {
      if (!permAddress.line1.trim()) {
        newErrors.permAddress.line1 = 'This field is required';
        isValid = false;
      }
      if (!permAddress.line2.trim()) {
        newErrors.permAddress.line2 = 'This field is required';
        isValid = false;
      }
      if (!permAddress.state) {
        newErrors.permAddress.state = 'This field is required';
        isValid = false;
      }
      if (!permAddress.district) {
        newErrors.permAddress.district = 'This field is required';
        isValid = false;
      }
      if (!permAddress.city) {
        newErrors.permAddress.city = 'This field is required';
        isValid = false;
      }
      if (!permAddress.pincode) {
        newErrors.permAddress.pincode = 'This field is required';
        isValid = false;
      }
    }

    setFormErrors(newErrors);
    return isValid;
  };

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		if (!validateForm()) return;

		try {
			const trimmedCorr = trimAddress(corrAddress);
			const trimmedPerm = sameAsCorrespondence
				? trimmedCorr
				: trimAddress(permAddress);
			const payload = mapAddressFormToApi({
				corrAddress: trimmedCorr,
      			permAddress: trimmedPerm,
				sameAsCorrespondence,
				candidateId,
			});
			await profileApi.postAddressDetails(candidateId, payload);
			toast.success("Address details have been saved successfully");
			setIsDirty(false);
			goNext();
		} catch (err) {
			console.error(err);
			toast.error("Failed to save address details");
		}
	};

	const handleCheckboxToggle = (e) => {
		const checked = e.target.checked;
		setSameAsCorrespondence(checked);
		setIsDirty(true);

		if (checked) {
			// copy values and clear permanent address errors
			setPermAddress({ ...corrAddress });
			setFormErrors(prev => ({
				...prev,
				permAddress: {}
			}));
		} else {
			// Clear any existing errors when unchecking
			setPermAddress({ ...EMPTY_ADDRESS });
			setFormErrors(prev => ({
				...prev,
				permAddress: {}
			}));
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
					<input 
                    type="text" 
                    className={`form-control ${formErrors.corrAddress?.line1 ? 'is-invalid' : ''}`} 
                    id="line1" 
                    value={corrAddress.line1} 
                    onChange={handleCorrChange} 
                  />
                  {formErrors.corrAddress?.line1 && (
                    <div className="invalid-feedback">{formErrors.corrAddress.line1}</div>
                  )}
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="line2" className="form-label">Address Line 2 <span className="text-danger">*</span></label>
					<input 
                    type="text" 
                    className={`form-control ${formErrors.corrAddress?.line2 ? 'is-invalid' : ''}`} 
                    id="line2" 
                    value={corrAddress.line2} 
                    onChange={handleCorrChange} 
                  />
                  {formErrors.corrAddress?.line2 && (
                    <div className="invalid-feedback">{formErrors.corrAddress.line2}</div>
                  )}
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="state" className="form-label">State <span className="text-danger">*</span></label>
					<select 
                    id="state" 
                    className={`form-select ${formErrors.corrAddress?.state ? 'is-invalid' : ''}`}
                    value={corrAddress.state}
                    onChange={handleCorrChange}
                  >
                    {formErrors.corrAddress?.state && (
                      <div className="invalid-feedback">{formErrors.corrAddress.state}</div>
                    )}
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
					<select 
                    id="district" 
                    className={`form-select ${formErrors.corrAddress?.district ? 'is-invalid' : ''}`}
                    value={corrAddress.district}
                    onChange={handleCorrChange}
                    disabled={!corrAddress.state}
                  >
                    {formErrors.corrAddress?.district && (
                      <div className="invalid-feedback">{formErrors.corrAddress.district}</div>
                    )}
						<option value="">Select District</option>
						{filteredDistricts.map(d => (
							<option key={d.districtId} value={d.districtId}>
								{d.districtName}
							</option>
						))}
					</select>
					{formErrors.permAddress?.district && (
                      <div className="invalid-feedback">{formErrors.permAddress.district}</div>
                    )}
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="city" className="form-label">City <span className="text-danger">*</span></label>
					<select 
                    id="city" 
                    className={`form-select ${formErrors.corrAddress?.city ? 'is-invalid' : ''}`}
                    value={corrAddress.city}
                    onChange={handleCorrChange}
                    disabled={!corrAddress.district}
                  >
                    {formErrors.corrAddress?.city && (
                      <div className="invalid-feedback">{formErrors.corrAddress.city}</div>
                    )}
						<option value="">Select City</option>
						{filteredCities.map(c => (
							<option key={c.cityId} value={c.cityId}>
								{c.cityName}
							</option>
						))}
					</select>
					{formErrors.permAddress?.city && (
                      <div className="invalid-feedback">{formErrors.permAddress.city}</div>
                    )}
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="pincode" className="form-label">Pin <span className="text-danger">*</span></label>
					<select 
                    id="pincode" 
                    className={`form-select ${formErrors.corrAddress?.pincode ? 'is-invalid' : ''}`}
                    value={corrAddress.pincode}
                    onChange={handleCorrChange}
                    disabled={!corrAddress.city}
                  >
                    {formErrors.corrAddress?.pincode && (
                      <div className="invalid-feedback">{formErrors.corrAddress.pincode}</div>
                    )}
						<option value="">Select Pincode</option>
						{filteredPincodes.map(p => (
							<option key={p.pincodeId} value={p.pincodeId}>
								{p.pin}
							</option>
						))}
					</select>
					{formErrors.permAddress?.pincode && (
                      <div className="invalid-feedback">{formErrors.permAddress.pincode}</div>
                    )}
				</div>

				<div className="col-md-12 col-sm-12 mt-4 d-flex align-items-center gap-2 pt-2 border-top">
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
					<input 
                    type="text" 
                    className={`form-control ${formErrors.permAddress?.line1 ? 'is-invalid' : ''}`} 
                    id="line1" 
                    value={permAddress.line1} 
                    onChange={handlePermChange} 
                    disabled={sameAsCorrespondence}
                  />
                  {formErrors.permAddress?.line1 && (
                    <div className="invalid-feedback">{formErrors.permAddress.line1}</div>
                  )}
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="line2" className="form-label">Address Line 2 <span className="text-danger">*</span></label>
					<input 
                    type="text" 
                    className={`form-control ${formErrors.permAddress?.line2 ? 'is-invalid' : ''}`} 
                    id="line2" 
                    value={permAddress.line2} 
                    onChange={handlePermChange} 
                    disabled={sameAsCorrespondence}
                  />
                  {formErrors.permAddress?.line2 && (
                    <div className="invalid-feedback">{formErrors.permAddress.line2}</div>
                  )}
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="state" className="form-label">State <span className="text-danger">*</span></label>
					<select
						className={`form-select ${formErrors.permAddress?.state ? 'is-invalid' : ''}`}
						id="state"
						value={permAddress.state}
						onChange={handlePermChange}
						disabled={sameAsCorrespondence}
					>
						<option value="">Select State</option>
						{masters.states.map(s => (
							<option key={s.stateId} value={s.stateId}>
								{s.stateName}
							</option>
						))}
					</select>
					{formErrors.permAddress?.state && (
                      <div className="invalid-feedback">{formErrors.permAddress.state}</div>
                    )}
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="district" className="form-label">District <span className="text-danger">*</span></label>
					<select
						className={`form-select ${formErrors.permAddress?.district ? 'is-invalid' : ''}`}
						id="district"
						value={permAddress.district}
						onChange={handlePermChange}
						disabled={sameAsCorrespondence || !permAddress.state}
					>
						<option value="">Select District</option>
						{permFilteredDistricts.map(d => (
							<option key={d.districtId} value={d.districtId}>
								{d.districtName}
							</option>
						))}
					</select>
					{formErrors.permAddress?.district && (
                      <div className="invalid-feedback">{formErrors.permAddress.district}</div>
                    )}
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="city" className="form-label">City <span className="text-danger">*</span></label>
					<select
						className={`form-select ${formErrors.permAddress?.city ? 'is-invalid' : ''}`}
						id="city"
						value={permAddress.city}
						onChange={handlePermChange}
						disabled={sameAsCorrespondence || !permAddress.district}
					>
						<option value="">Select City</option>
						{permFilteredCities.map(c => (
							<option key={c.cityId} value={c.cityId}>
								{c.cityName}
							</option>
						))}
					</select>
					{formErrors.permAddress?.city && (
                      <div className="invalid-feedback">{formErrors.permAddress.city}</div>
                    )}
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="pincode" className="form-label">Pin <span className="text-danger">*</span></label>
					<select
						className={`form-select ${formErrors.permAddress?.pincode ? 'is-invalid' : ''}`}
						id="pincode"
						value={permAddress.pincode}
						onChange={handlePermChange}
						disabled={sameAsCorrespondence || !permAddress.city}
					>
						<option value="">Select Pincode</option>
						{permFilteredPincodes.map(p => (
							<option key={p.pincodeId} value={p.pincodeId}>
								{p.pin}
							</option>
						))}
					</select>
					{formErrors.permAddress?.pincode && (
                      <div className="invalid-feedback">{formErrors.permAddress.pincode}</div>
                    )}
				</div>

				<div className="d-flex justify-content-between">
					<div>
						<BackButtonWithConfirmation goBack={goBack} isDirty={isDirty} />
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
