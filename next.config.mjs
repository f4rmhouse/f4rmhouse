/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      dirs: ["api", "article", "components", "dashboard", "detail", "fonts", "login", "search"]
    },
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'f4-public.s3.eu-central-1.amazonaws.com',
            port: '',
            pathname: '/public/y2k-wp.webp',
          },
          {
            protocol: 'https',
            hostname: 'f4-public.s3.eu-central-1.amazonaws.com',
            port: '',
            pathname: '/public/assets/banner_item-1.webp',
          },
          {
            protocol: 'https',
            hostname: 'f4-public.s3.eu-central-1.amazonaws.com',
            port: '',
            pathname: '/public/assets/blog-thumb-1.webp',
          },
          {
            protocol: 'https',
            hostname: 'f4-public.s3.eu-central-1.amazonaws.com',
            port: '',
            pathname: '/public/assets/blog-thumb-2.png',
          },
          {
            protocol: 'https',
            hostname: 'f4-public.s3.eu-central-1.amazonaws.com',
            port: '',
            pathname: '/public/assets/blog-thumb-3.png',
          },
          {
            protocol: 'https',
            hostname: 'media.licdn.com',
            port: '',
            pathname: '/dms/image/D5612AQFsxjC67OTtwg/article-cover_image-shrink_720_1280/0/1678313143886',
          },
          {
            protocol: 'https',
            hostname: 'miro.medium.com',
            port: '',
            pathname: '/v2/resize:fit:2000/1*7ru6QfOFYijQgi6omOP29w.png',
          },
          {
            protocol: 'https',
            hostname: 'static.vecteezy.com',
            port: '',
            pathname: '/system/resources/previews/032/714/330/non_2x/pc-retro-y2k-desktop-lofi-wallpaper-nostalgic-computer-interface-2d-scene-cartoon-flat-illustration-upload-files-sunshine-peony-hearts-chill-art-lo-fi-aesthetic-colorful-background-vector.jpg',
          },
          {
            protocol: 'https',
            hostname: 'cdn.prod.website-files.com',
            port: '',
            pathname: '/5a9ee6416e90d20001b20038/6289efcc9a52f65ff46e8400_white-gradient.png',
          },
          {
            protocol: 'https',
            hostname: 'fs.artdevivre.com',
            port: '',
            pathname: '/storage/articles/main-photos-articles/3ddd1d005abe8cc1789152da71cee3e0.jpg',
          },
          {
            protocol: 'https',
            hostname: 'cdnp.kittl.com',
            port: '',
            pathname: '/51d12197-8a4c-47ad-a1ea-96d4b1a329b0_kittl-ai-image-generator-2-dalle-3-black-model-bpoc-galactic-fashion-retro-space-ship-illustration.jpg',
          },
          {
            protocol: 'https',
            hostname: 'images.ctfassets.net',
            port: '',
            pathname: '/kftzwdyauwt9/Nw3a33C8bfO7VJMCTNgSz/3633c190fd7309970a9ac85d7c7d3989/avocado-square.jpg',
          },
          {
            protocol: 'https',
            hostname: 'static1.srcdn.com',
            port: '',
            pathname: '/wordpress/wp-content/uploads/2022/06/DALL-E-mini-Shiba-inu.jpg',
          },
          {
            protocol: 'https',
            hostname: 'miro.medium.com',
            port: '',
            pathname: '/v2/resize:fit:1400/1*0FwivlgxFRvSoPFl5xQpFw.png',
          },
          {
            protocol: 'https',
            hostname: 'images.ctfassets.net',
            port: '',
            pathname: '/kftzwdyauwt9/5VVBxDWhs6Cp6REifYnloS/81c02b5d73db5dc85365e15feb3b58e4/Anastronautridingahorseinaphotorealisticstyle9.jpg',
          },
          {
            protocol: 'https',
            hostname: 'upload.wikimedia.org',
            port: '',
            pathname: '/wikipedia/en/4/41/DALL-E_2_artificial_intelligence_digital_image_generated_photo.jpg',
          },
          {
            protocol: 'https',
            hostname: 's.yimg.com',
            port: '',
            pathname: '/ny/api/res/1.2/0wl0v9nGN6azAn0SmTOKxQ--/YXBwaWQ9aGlnaGxhbmRlcjt3PTY0MDtoPTQ2Nw--/https://s.yimg.com/os/creatr-uploaded-images/2022-04/cacc8fa0-b652-11ec-af75-438ac34a567d',
          },
          {
            protocol: 'https',
            hostname: 'static1.srcdn.com',
            port: '',
            pathname: '/wordpress/wp-content/uploads/2020/10/Dave-Bowman-in-2001-A-Space-Odyssey.jpg',
          },
          {
            protocol: 'https',
            hostname: 'whalebonemag.com',
            port: '',
            pathname: '/wp-content/uploads/2021/12/explosion-4.jpg',
          },
          {
            protocol: 'https',
            hostname: 'www.risorsalavoro.it',
            port: '',
            pathname: '/wp-content/uploads/2014/12/stuntmen.jpg',
          },
          {
            protocol: 'https',
            hostname: 'media.tenor.com',
            port: '',
            pathname: '/-MrMt3zY6OwAAAAe/caught-emote-caught-emoji.png',
          },
          {
            protocol: 'https',
            hostname: 'i.ytimg.com',
            port: '',
            pathname: '/vi/NdN153giLdI/maxresdefault.jpg',
          },
          {
            protocol: 'https',
            hostname: 'f4-public.s3.eu-central-1.amazonaws.com',
            port: '',
            pathname: '/*',
          },
          {
            protocol: 'https',
            hostname: 't3.ftcdn.net',
            port: '',
            pathname: '/jpg/05/58/45/02/360_F_558450244_JVL848woVRCZmFXWQqD0imauEyfSgKnU.jpg',
          },
          {
            protocol: 'https',
            hostname: 't3.ftcdn.net',
            port: '',
            pathname: '/jpg/06/21/04/62/360_F_621046234_5o3yVtMaEKBqwQuqVYvK6hjHzifyY0qy.jpg',
          },
          {
            protocol: 'https',
            hostname: 'static.vecteezy.com',
            port: '',
            pathname: '/system/resources/thumbnails/046/667/235/small_2x/template-of-black-cow-peeking-out-from-behind-bright-yellow-background-with-copy-space-photo.jpg',
          },
        ],
      },
};

export default nextConfig;
