"use client";

import { useState } from "react";
import { Bug } from "lucide-react";
import Image from "next/image";
import { useTheme } from "../../context/ThemeContext";
import Modal from "./modal/Modal";
import { useSession } from "next-auth/react";
import Store from "@/app/microstore/Store";

export default function SendFeedback() {
  const session = useSession()
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bugDescription, setBugDescription] = useState("");
  const [stepsToReproduce, setStepsToReproduce] = useState("");
  const [expectedBehavior, setExpectedBehavior] = useState("");
  const [actualBehavior, setActualBehavior] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bugDescription.trim()) {
      alert("Please fill in the bug title and description");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create bug report data
      const bugReport = {
        description: bugDescription.trim(),
        stepsToReproduce: stepsToReproduce.trim(),
        actualBehavior: actualBehavior.trim(),
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };

      let data = {
        user: session.data?.user?.email,
        type: "bug report",
        content: JSON.stringify(bugReport),
        number: 0
      }

      // Simulate API call
      let store = new Store()
      await store.createComm(data)
      
      setSubmitSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setBugDescription("");
        setStepsToReproduce("");
        setActualBehavior("");
        setSubmitSuccess(false);
        setIsModalOpen(false);
      }, 2000);
      
    } catch (error) {
      console.error("Error submitting bug report:", error);
      alert("Failed to submit bug report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSubmitSuccess(false);
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex text-neutral-500 hover:text-white px-1 underline text-xs"
        title="Report a bug"
      >
        <Bug className="w-4 h-4" />
        Report a bug
      </button>

      <Modal open={isModalOpen} title="Report a Bug" onClose={handleClose}>
        <div className="p-2 max-w-2xl w-full">
          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="w-64 h-64 mx-auto mb-4 rounded-full flex items-center justify-center relative overflow-hidden" 
                   style={{ backgroundColor: theme.hoverColor }}>
                <Image className="object-cover" fill src="https://f4-public.s3.eu-central-1.amazonaws.com/artifacts/0adf3243-a050-4c8f-9de6-f7d74de944f8.jpg" alt="f4rmer investigating bug"/>
              </div>
              <h3 className="text-lg font-medium mb-2" style={{ color: theme.textColorPrimary }}>
                Bug Report Submitted!
              </h3>
              <p style={{ color: theme.textColorSecondary }}>
                Thank you for helping us improve the f4rmhouse.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.textColorPrimary }}>
                  Bug Description*
                </label>
                <input
                  type="text"
                  value={bugDescription}
                  onChange={(e) => setBugDescription(e.target.value)}
                  placeholder="Description of the bug"
                  className="w-full p-1 border text-sm text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.textColorPrimary }}>
                  Steps to Reproduce
                </label>
                <textarea
                  value={stepsToReproduce}
                  onChange={(e) => setStepsToReproduce(e.target.value)}
                  placeholder="1. Go to...&#10;2. Click on...&#10;3. See error"
                  rows={3}
                  className="w-full p-1 border text-sm resize-none text-black"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.textColorPrimary }}>
                    Expected Behavior
                  </label>
                  <textarea
                    value={expectedBehavior}
                    onChange={(e) => setExpectedBehavior(e.target.value)}
                    placeholder="What should have happened?"
                    rows={2}
                    className="w-full p-1 border text-sm resize-none text-black"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2 px-4 rounded-lg border transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !bugDescription.trim()}
                  className="flex-1 py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
                  style={{
                    backgroundColor: theme.accentColor,
                    color: theme.backgroundColor
                  }}
                >
                  {isSubmitting ? "Submitting..." : "Submit Bug Report"}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </>
  );
}