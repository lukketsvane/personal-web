export function getPostThumbnails(mdxContent: string) {
    try {
      // First, find the ImageGallery component section
      const imageGalleryRegex = /images={\[([\s\S]*?)\]}/
      const match = mdxContent.match(imageGalleryRegex)
      
      if (!match) {
        console.log('No ImageGallery found in content')
        return null
      }
  
      // Extract the array content
      const arrayContent = match[1]
  
      // Convert the string to valid JSON
      const jsonString = `[${arrayContent}]`
        .replace(/\s+/g, ' ')
        .replace(/,\s*]/g, ']')
        .replace(/'/g, '"')
  
      // Parse the JSON
      const images = JSON.parse(jsonString)
      console.log('Successfully parsed images:', images.length)
      return images
  
    } catch (error) {
      console.error('Error parsing thumbnails:', error)
      return null
    }
  }
  