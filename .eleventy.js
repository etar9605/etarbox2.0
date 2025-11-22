module.exports = function(eleventyConfig) {

  // Báo cho Eleventy copy 2 thư mục này sang website kết quả
  eleventyConfig.addPassthroughCopy("styles");
  eleventyConfig.addPassthroughCopy("static");
  eleventyConfig.addPassthroughCopy("script");
  eleventyConfig.addPassthroughCopy("dnd/data");
  return {
    // Báo cho Eleventy biết "khuôn" nằm ở đâu
    dir: {
      includes: "_includes"
    }
  };
};