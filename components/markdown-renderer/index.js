import React /* , { useState, useEffect, useCallback } */ from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Heading } from '@chakra-ui/react'
import { UnorderedList } from '@chakra-ui/react'
import { OrderedList } from '@chakra-ui/react'
import { ListItem } from '@chakra-ui/react'

// const JsxParserWithNoSSR = dynamic(() => import('react-jsx-parser'), {
//   ssr: false,
// });

const H1 = ({ children }) => <Heading as="h1" size="4xl">{children}</Heading>
const H2 = ({ children }) => <Heading as="h2" size="3xl">{children}</Heading>
const H3 = ({ children }) => <Heading as="h3" size="2xl">{children}</Heading>
const H4 = ({ children }) => <Heading as="h4" size="xl">{children}</Heading>
const H5 = ({ children }) => <Heading as="h5" size="lg">{children}</Heading>
const H6 = ({ children }) => <Heading as="h6" size="md">{children}</Heading>


// const customMarkdown = {
//   Youtube: ({ videoId }) => (
//     <FullWidthContainerMobile>
//       <Youtube videoId={videoId} />
//     </FullWidthContainerMobile>
//   ),
//   Image: ({ src, alt }) => (
//     <FullWidthContainerMobile>
//       <Image src={src} alt={alt} />
//     </FullWidthContainerMobile>
//   ),
//   FeaturedLink: ({ src, alt, url, author, title, description }) => {
//     return (
//       <FullWidthContainerMobile>
//         <FeaturedLink
//           src={src}
//           alt={alt}
//           url={url}
//           author={author}
//           title={title}
//           description={description}
//         />
//       </FullWidthContainerMobile>
//     );
//   },
// };

// const Code = ({ language, value }) => {
//   // render 'jsx' type as self-contained JSX (with only above components exposed).
//
//   if (language === 'react') {
//     return <JsxParserWithNoSSR jsx={value} components={customMarkdown} />;
//   }
//
//   // render 'pie' typ as YAML and hand it to a pie.
//   // if (language === 'pie') {
//   //   return <PieChart data={yaml.safeLoad(value)} />
//   // }
//
//   // Try to syntax-highlight, using my custom style.
//   // return <synHi language={language}>{value}</SynHi>
//
//   return null;
// };

// const ContentImgWrap = styled.div`
//   display: flex;
//   justify-content: center;
//   margin-top: ${themes.verticalSpacing};
//   margin-bottom: ${themes.verticalSpacing};
// `;

const MarkdownRenderer = ({
  source,
  // source,
  // content,
  // contentImages,
  // contentImageSizes,
  // sourceWithFeaturedLinks,
}) => {
  // const [sourceText, setSourceText] = useState(content || '');
  //
  // const transformImageUrl = React.useCallback(
  //   (uri = '') => {
  //     if (uri.substr(0, 4) !== 'img:') {
  //       return uri;
  //     }
  //     const cfImage = contentImages.find((ci) => ci.id === uri.substr(4)) || {};
  //     if (typeof cfImage === 'string') {
  //       return cfImage;
  //     } else if (typeof cfImage.dataURL === 'string') {
  //       return cfImage.dataURL;
  //     }
  //   },
  //   [contentImages],
  // );
  // const getImageSizeProps = React.useCallback(
  //   (uri = '') => {
  //     if (uri.substr(0, 4) !== 'img:') {
  //       return uri;
  //     }
  //     const cfId = uri.substr(4);
  //     return cfId ? contentImageSizes[cfId] : {};
  //   },
  //   [contentImages, contentImageSizes],
  // );
  //
  // const ContentImg = useCallback(
  //   (props) => {
  //     const imageSizeProps = getImageSizeProps(props.src);
  //     return (
        {/*<ContentImgWrap>*/}
          {/*<Image src={transformImageUrl(props.src)} {...imageSizeProps} />*/}
        // </ContentImgWrap>
      // );
    // },
    // [transformImageUrl, getImageSizeProps],
  // );
  //
  // useEffect(() => {
  //   if (!source) return;
  //
  //   fetch(source)
  //     .then((response) => response.text())
  //     .then((response) => {
  //       setSourceText(response);
  //     })
  //     .catch(() => {});
  // }, [source]);
  // const sourceUsed = sourceWithFeaturedLinks || sourceText;

  // source={source}
  // renderers={{
  //   heading: MarkdownHeading,
  //   paragraph: P,
  //   list: P,
  //   link: Link,
  //   blockquote: BlockQuote,
  //   code: Code,
  //   image: ContentImg,
  // }}

  // return (
  //   <MarkdownRenderer>
  //     <div>
  //       {source}
  //     </div>
  //   </MarkdownRenderer>
  // )
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: H1,
        h2: H2,
        h3: H3,
        h4: H4,
        h5: H5,
        h6: H6,
        ol: OrderedList,
        ul: UnorderedList,
        li: ListItem,
      }}
    >
      {source}
    </Markdown>
  )
}

export default MarkdownRenderer
