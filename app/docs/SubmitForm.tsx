"use client";

import { useState } from "react";
import Store from "../microstore/Store";
import { sanitizeFormData } from "../utils/inputSanitization";

export default function SubmitForm() {
  const [mcpUrl, setMcpUrl] = useState("");
  const [email, setEmail] = useState("");
  const [creator, setCreator] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentInfo, setPaymentInfo] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePaymentMethodClick = (method: string) => {
    setPaymentMethod(method);
    setPaymentInfo(""); // Reset payment info when switching methods
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!mcpUrl.trim()) {
      alert("MCP URL is required");
      return;
    }
    if (!creator.trim()) {
      alert("Creator is required");
      return;
    }
    if (!email.trim()) {
      alert("Email is required");
      return;
    }
    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }
    if (!paymentInfo.trim()) {
      alert("Payment information is required");
      return;
    }

    // Sanitize and validate all inputs
    const formData = {
      mcpUrl,
      creator,
      description,
      email,
      paymentMethod,
      paymentInfo
    };

    const { sanitized, errors } = sanitizeFormData(formData);

    if (errors.length > 0) {
      alert(`Validation failed:\n${errors.join('\n')}`);
      return;
    }

    setIsSubmitting(true);

    try {
      let data = {
          user: sanitized.email,
          type: "mcp submission",
          content: JSON.stringify({
              mcpUrl: sanitized.mcpUrl,
              creator: sanitized.creator,
              description: sanitized.description,
              paymentMethod: sanitized.paymentMethod,
              paymentInfo: sanitized.paymentInfo
          }),
          number: 0
      }

      const store = new Store();
      await store.createComm(data);
      
      // Show success modal
      setShowSuccessModal(true);
      
      // Reset form
      setMcpUrl("");
      setEmail("");
      setCreator("");
      setDescription("");
      setPaymentMethod("");
      setPaymentInfo("");
      
    } catch (error) {
      console.error("Submission error:", error);
      alert("There was an error submitting your MCP server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <>
    <form className="w-full gap-2 flex flex-col" onSubmit={handleSubmit}>
      <h1>Submit an MCP server</h1>
      <p className="text-sm">
        If the MCP server you submit is <b>useful</b> and <b>secure</b> we will give you with a $10 reward. 
        If the MCP server you submit gets 1000 <b>unique</b> requests within 1 month of submission you will be 
        rewarded with another 90$. Rewards are capped at 10/user so you can get a maximum of $1000 if you 
        submit the maximum amount and they get enough requests.
      </p>
      <label htmlFor="mcpUrl">URL *</label>
      <input 
        className="w-full text-sm p-1 text-black" 
        type="url" 
        placeholder="MCP URL"
        value={mcpUrl}
        onChange={(e) => setMcpUrl(e.target.value)}
        required
      />
      <label htmlFor="creator">Creator *</label>
      <input 
        className="w-full text-sm p-1 text-black" 
        type="text" 
        placeholder="Creator"
        value={creator}
        onChange={(e) => setCreator(e.target.value)}
        required
      />
      <p className="text-xs">If you are the creator enter your own email</p>
      <label htmlFor="description">Description (optional)</label>
      <textarea
        className="w-full text-sm p-1 text-black"
        placeholder="Other information e.g. homepage, detailed descriptions etc."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <label htmlFor="email">Email *</label>
      <input 
        className="w-full text-sm p-1 text-black" 
        type="email" 
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <label htmlFor="rewards">Payment information (pick one)</label>
      <div className="flex gap-2">
        <button 
          type="button"
          className={`p-1 w-1/2 flex ${paymentMethod === 'paypal' ? 'underline' : 'hover:underline'}`}
          onClick={() => handlePaymentMethodClick('paypal')}
        >
          <img className="w-10 rounded-full" src={"https://cdn.pixabay.com/photo/2018/05/08/21/29/paypal-3384015_640.png"}/>
          <span className="my-auto ml-5">PayPal</span>
        </button>
        <button 
          type="button"
          className={`p-1 w-1/2 flex ${paymentMethod === 'crypto' ? 'underline' : 'hover:underline'}`}
          onClick={() => handlePaymentMethodClick('crypto')}
        >
          <img className="w-10 rounded-full" src={"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbBMfDxr1PrxlKVnOBktTGlNgXSVYUT0LB7Q&s"}/>
          <span className="my-auto ml-5">Crypto</span>
        </button>
      </div>
      
      {paymentMethod && (
        <div className="mt-2">
          <label htmlFor="paymentInfo">
            {paymentMethod === 'paypal' ? 'PayPal Email Address *' : 'Crypto Wallet Address *'}
          </label>
          <input
            className="w-full text-sm p-1 text-black"
            type={paymentMethod === 'paypal' ? 'email' : 'text'}
            placeholder={paymentMethod === 'paypal' ? 'your-email@example.com' : 'Your wallet address'}
            value={paymentInfo}
            onChange={(e) => setPaymentInfo(e.target.value)}
            required
          />
        </div>
      )}
      <button 
        className="w-full text-sm p-1 hover:underline text-blue-500" 
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>

    {/* Success Modal */}
    {showSuccessModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-48 w-48 rounded-full bg-green-100 mb-4">
                <img className="rounded-full" src="https://f4-public.s3.eu-central-1.amazonaws.com/artifacts/55c02ac7-ef1e-41cf-a0fa-b429303b5319.jpg"/>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              MCP Server Submitted Successfully!
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Thank you for your submission. We'll review your MCP server and get back to you soon. 
              If approved, you'll receive your $10 reward!
            </p>
            <button
              onClick={closeSuccessModal}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
