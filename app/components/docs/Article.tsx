"use client"
import { useEffect, useState } from "react";
import { remark } from "remark";
import html from 'remark-html';

/**
 * F4Status displays the login status of a user (logged in/logged out)
 * @param param0 
 * @returns 
 */
function Article({fname}: {fname:string}) {
    // Different tutorials to help user get accustomed with the platform
  const [markdown, setMarkdown] = useState('');

  useEffect(() => {
    // Load the markdown file
    fetch(fname) // Adjust the path based on your project structure
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load markdown file');
        }
        return response.text();
      })
      .then(text => {
        remark()
            .use(html)
            .process(text).then(e => {setMarkdown(e.toString());console.log("HTML: ", e.toString())});
      })
      .catch(error => {
        console.error('Error loading markdown:', error);
        setMarkdown('# Error\nFailed to load markdown content.');
      });
  }, []);

  return (
    <main>
      <div className="flex sm:w-[60%] bg-[#0d1117] rounded-md border border-neutral-800 mb-20">
        <div className="relative justify-between p-5 w-full">
          <div className="text-xl">
            <div className="markdown-body list-disc">
                <div className="markdown-body list-disc" dangerouslySetInnerHTML={{ __html: markdown.replace("<ul>", "<ul class='list-disc list-inside'>")}} />
            </div>
          </div>
          </div>
      </div>
    </main>
  );
}


export default Article 