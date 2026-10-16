import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { STATE_CITIES, STATES } from "@/data/indiaStatesCities";
import {
  BIGIN_CSS,
  DIAL_CODES,
  Honeypot,
  Row,
} from "@/components/formKit";

/**
 * Native replica of the Zoho Bigin "WORKOUT BATCH" form.
 *
 * The lead goes straight to a Zoho Flow incoming webhook, which creates the
 * Bigin contact. Zoho Flow serves no CORS headers, so the request is sent as
 * form-encoded data with mode "no-cors": it stays a "simple" request (no
 * preflight) and Flow reads it as Form data. The response is opaque, so only
 * a network failure can be detected here.
 */

const FLOW_WEBHOOK_URL = import.meta.env.VITE_ZOHO_FLOW_WEBHOOK_URL || "";
const LEAD_SOURCE = import.meta.env.VITE_LEAD_SOURCE || "CAGURU WB";

const GROUP_OPTIONS = ["Group 1", "Group 2", "Both Groups", "Unit 2D"];

const WorkoutBatchForm = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    "First Name": "",
    "Last Name": "",
    dialCode: "+91",
    phone: "",
    Group: "",
    State: "",
    "Other City": "",
    company: "", // honeypot — must stay empty for real users
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const set = (name) => (e) => {
    setValues((v) => ({ ...v, [name]: e.target.value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  // Changing the state resets the dependent city selection.
  const setState = (e) => {
    const State = e.target.value;
    setValues((v) => ({ ...v, State, "Other City": "" }));
    setErrors((er) => ({ ...er, State: undefined }));
  };

  const validate = () => {
    const e = {};
    const req = (k, msg) => {
      if (!values[k] || !String(values[k]).trim()) e[k] = msg || "This field is required.";
    };
    req("First Name");
    req("Last Name");
    if (values["First Name"].trim() && /\d/.test(values["First Name"]))
      e["First Name"] = "Only letters are allowed.";
    if (values["Last Name"].trim() && /\d/.test(values["Last Name"]))
      e["Last Name"] = "Only letters are allowed.";
    if (!values.phone.trim()) e.phone = "This field is required.";
    else if (!/^[0-9]{6,15}$/.test(values.phone.trim()))
      e.phone = "Enter a valid Phone.";
    req("Group");
    req("State");
    req("Other City");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    // Honeypot filled → a bot. Pretend success, send nothing.
    if (values.company) {
      navigate("/workout-batch-success");
      return;
    }

    if (!FLOW_WEBHOOK_URL) {
      setSubmitError("Form is not configured (missing Zoho Flow webhook URL).");
      return;
    }

    const phone = values.phone.trim();
    const payload = {
      first_name: values["First Name"].trim(),
      last_name: values["Last Name"].trim(),
      dial_code: values.dialCode,
      phone,
      // Bigin's Phone field is a single string — send it pre-joined.
      full_phone: `${values.dialCode}${phone}`,
      ca_status: "Intermediate", // the batch is CA Inter only
      attempt: values.Group, // Bigin "Attempt" field
      state: values.State,
      city: values["Other City"],
      location: `${values["Other City"]}, ${values.State}`,
      lead_source: LEAD_SOURCE,
      page_url: window.location.href,
      submitted_at: new Date().toISOString(),
    };

    setSubmitting(true);
    try {
      await fetch(FLOW_WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        keepalive: true,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(payload).toString(),
      });

      if (typeof window.gtag === "function")
        window.gtag("event", "workout_batch_submit", {
          event_category: "engagement",
          event_label: "Workout Batch Enroll",
        });

      navigate("/workout-batch-success");
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bwf-scope">
      <style>{BIGIN_CSS}</style>

      <div className="bwf-wrapper">
        <form className="bwf-form" onSubmit={handleSubmit} noValidate>
          <h1 className="bwf-header">WORKOUT BATCH</h1>

          <Honeypot value={values.company} onChange={set("company")} />

          <Row label="First Name" name="First Name" error={errors["First Name"]}>
            <input
              name="First Name"
              maxLength={40}
              type="text"
              className="bwf-input"
              value={values["First Name"]}
              onChange={set("First Name")}
            />
          </Row>

          <Row label="Last Name" name="Last Name" error={errors["Last Name"]}>
            <input
              name="Last Name"
              maxLength={80}
              type="text"
              className="bwf-input"
              value={values["Last Name"]}
              onChange={set("Last Name")}
            />
          </Row>

          <Row label="Phone" name="phone" error={errors.phone}>
            <select
              className="bwf-dialcode"
              value={values.dialCode}
              onChange={set("dialCode")}
              aria-label="Country code"
            >
              {DIAL_CODES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              maxLength={20}
              type="tel"
              inputMode="numeric"
              className="bwf-input bwf-phone"
              value={values.phone}
              onChange={set("phone")}
            />
          </Row>

          <Row label="What Group(s) are you planning to attempt in Jan 2027?" name="Group" error={errors.Group}>
            <select
              name="Group"
              className="bwf-input bwf-select"
              value={values.Group}
              onChange={set("Group")}
            >
              <option value="" disabled>
                -Select-
              </option>
              {GROUP_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Row>

          <Row label="State &amp; City" name="location" error={errors.State || errors["Other City"]}>
            <div className="bwf-two-col">
              <select
                name="State"
                className="bwf-input bwf-select"
                value={values.State}
                onChange={setState}
              >
                <option value="" disabled>
                  -State-
                </option>
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                name="Other City"
                className="bwf-input bwf-select"
                value={values["Other City"]}
                onChange={set("Other City")}
                disabled={!values.State}
              >
                <option value="" disabled>
                  {values.State ? "-City-" : "-Select state first-"}
                </option>
                {(STATE_CITIES[values.State] || []).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </Row>

          {submitError && <div className="bwf-submit-error">{submitError}</div>}

          <div className="bwf-btn-wrap">
            <button type="submit" className="bwf-btn" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkoutBatchForm;
