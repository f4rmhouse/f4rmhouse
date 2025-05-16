"use client"
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import {PaymentElement} from '@stripe/react-stripe-js';

const SetupForm = () => {

  return (
    <form className="w-full">
      <PaymentElement />
      <button>Submit</button>
    </form>
  );
};

/**
 * Billing handles displays the current invoice for the user. If no billing method exists it prompts the user to 
 * create one
 * @returns 
 */
export default function Billing() {
  const stripePromise = loadStripe('unused');
  const sk = ""

  const flat = "flat"

  const appearance = {
    theme: "flat" as typeof flat,
    variables: {
      fontFamily: 'sans-serif',
      fontWeightNormal: '500',
      borderRadius: '4px',
      colorBackground: '#000000',
      colorPrimary: '#1f2937',
      accessibleColorOnColorPrimary: '#FFFFFF',
      colorText: 'white',
      colorTextSecondary: 'white',
      colorTextPlaceholder: '#ABB2BF',
      tabIconColor: 'white',
      logoColor: 'dark'
    },
    rules: {
      '.Input': {
        backgroundColor: '#000000',
        border: '1px solid var(--colorPrimary)'
      }
    }
  };
  const options = {
    // passing the SetupIntent's client secret
    clientSecret: sk,
    // Fully customizable with appearance API.
    appearance: appearance
  };

  return (
    <div className="mt-20 w-[50vw] m-auto">
      <div className="w-full">
        <Elements stripe={stripePromise} options={options}>
          <SetupForm />
        </Elements>
      </div>
    </div>
  );
  }