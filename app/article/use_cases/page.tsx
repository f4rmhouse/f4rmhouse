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
            <p className="text-4xl font-white font-bold">what can a F4RMER even do?</p>
            <hr className="border-neutral-600 mt-8" />
            <Paragraph>Recently, the much hyped Grok3 released. Using the largest and most expensive GPU cluster ever to have been constructed. They created a model marginally better than the almost one year old GPT-4o.</Paragraph>
            <Paragraph>Looking soberly at the market, the massive investments put into larger and larger AI models don't really live up to the hype or generate anywhere near the revenue needed to operate them. Other than gimmicky apps and a myriad of "summarise"/"generate"/"simplify" buttons, that you rarely press, there hasn't been much to brag about when it comes to actual *usability* of AI models in about 2 years.</Paragraph>
            <Paragraph>In this articles we'll go through some of the new use cases enabled for LLMs by f4rmhouse. At f4rmhouse our goal is to make AI usable!</Paragraph>
            <Header>Master your communication</Header>
            <Paragraph>In a fast paced information-age you need to stay up to date on everything going on.</Paragraph>
            <Paragraph>A f4rmer connected to an email server allows you to streamline your communication by quickly sending customized emails to thousands or even millions of users. SMPT_PRO allows you to quickly create a customized email server that your f4rmer can use to send and receive emails for your business or for personal use.</Paragraph>
            <div className="grid grid-cols-2 mt-12 mb-12">
              <SmallAppCard app={MockAppCardType}/>
            </div>
            <Paragraph>This can be customized with NEWSLETTER_GENERATOR or DASHBOARDER to generate pretty emails that summarize information from an excel sheet or a csv file.</Paragraph>
            <div className="grid grid-cols-2 mt-12 mb-12">
              <SmallAppCard app={MockAppCardType}/>
              <SmallAppCard app={MockAppCardType}/>
            </div>
            <Header>Verify information!</Header>
            <Paragraph>Misinformation is a lot easier to create than it is to debunk.</Paragraph>
            <Paragraph>FACTCHECK is connected to the the largest professional fact checking services allowing f4rmers to quickly and see how accurate a claim is. This is especially useful in todays toxic media environment.</Paragraph>
            <div className="grid grid-cols-2 mt-12 mb-12">
              <SmallAppCard app={MockAppCardType}/>
            </div>
            <Header>File conversion</Header>
            <Paragraph>Do you ever get stuck converting from one file format to another? .docx to .pdf? .csv to .md? .png to .webp? </Paragraph>
            <Paragraph>Most programs have built in functions to export to any file format you want. But sometimes they don't and you're just out of luck. Well not anymore. On f4rmhouse we have actions to cover any possible file conversion need you might have. All you need to do is connect your actions to a f4rmer and BAM, you're done. </Paragraph>
            <div className="grid grid-cols-2 mt-12 mb-12">
              <SmallAppCard app={MockAppCardType}/>
              <SmallAppCard app={MockAppCardType}/>
              <SmallAppCard app={MockAppCardType}/>
              <SmallAppCard app={MockAppCardType}/>
            </div>
            <div className="mb-20"></div>
          </div>
        </div>
    );
  }
  