import SmallAppCard from "@/app/components/card/SmallAppCard";
import { MockAppCardType } from "@/app/components/mocks/MockAppCardType";
import Header from "@/app/components/text/Header";
import Paragraph from "@/app/components/text/Paragraph";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";

export default function Article() {

    return (
        <div className="pt-18 grid grid-cols-12">
          <div className="p-10 lg:p-0 col-span-12 lg:col-start-5 lg:col-span-5 lg:pt-10">
            <Link href="/" className="bg-red-500 m-2 bg-red-500"><FaArrowLeft size={30} className="transition-all hover:bg-zinc-600 bg-zinc-700 p-2 rounded-full" /></Link>
            <p className="text-4xl font-white font-bold">f4rmhouses dedication to revolutionize security in the AI space</p>
            <hr className="border-neutral-600 mt-8" />
            <Paragraph>AI is the most consequential technology ever created by humans. Why is security never a priority? </Paragraph>
            <Paragraph>Artificial Intelligence is one of the most transformative technologies ever developed. Yet, despite its significance, security often remains an afterthought for many AI companies. Prioritizing security from the outset has historically driven greater consumer adoption—examples include WhatsApp, Signal, and cryptocurrencies, all of which gained traction due to their reputation as secure alternatives to established players.</Paragraph>
            <Paragraph>At f4rmhouse, security is not just a priority—it is the foundation of everything we do. Our commitment to security ensures that users can trust our platform to protect their data and safeguard against malicious threats. Below are some of the core security measures we implement.</Paragraph>
            <Header>Modular deployments</Header>
            <Paragraph>Each action deployed on f4rmhouse is deployed as a docker container and run in an isolated runtime unable to access any data outside of the environment defined by the developer. This makes it impossible for a malicious actor to access any data outside of the container that has been deployed. The only data a malicious actor could get would be data that is directly given to it through a use prompt.</Paragraph>
            <Header>Data encryption</Header>
            <Paragraph>All private data stored or transmitted on f4rmhouse is encrypted, ensuring that only the rightful owner can access it. This means sensitive information, such as passwords or private data, remains inaccessible to hackers and even to f4rmhouse administrators, eliminating the risk of internal misuse or unauthorized access.</Paragraph>
            <Header>Access control</Header>
            <Paragraph>f4rmhouse enforces rigorous access control policies to protect users and their assets. Only authorized individuals can interact with deployed AI agents ("f4rmers"), ensuring that sensitive data and critical operations remain secure. Additionally, our access control mechanisms guarantee that payouts for AI-driven actions are issued only to their rightful creators, preventing fraudulent activity and unauthorized financial transactions.</Paragraph>
            <Header>Conclusion</Header>
            <Paragraph>Security is at the core of f4rmhouse's mission to revolutionize AI. By implementing robust isolation, encryption, and access control measures, we provide a secure and trustworthy environment for AI-driven applications. As AI continues to evolve, we remain steadfast in our dedication to setting new standards for security in the industry.</Paragraph>
            <div className="mb-20"></div>
          </div>
        </div>
    );
  }
  