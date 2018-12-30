module.exports = function(grunt) {
  grunt.initConfig({
    dtsGenerator: {
      options: {
        name: "BTFlyEditor",
        project: __dirname,
        out: "dist/index.d.ts"
      },
      targets: {}
    }
  });

  grunt.loadNpmTasks("dts-generator");

  //Register Tasks
  grunt.registerTask("generate-typings", ["dtsGenerator"]);
};
