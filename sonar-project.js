const sonarqubeScanner = require('sonarqube-scanner')
sonarqubeScanner(
  {
    serverUrl: 'http://104.211.8.208', //# must be unique in a given SonarQube instance
    token: 'ad54568eb98a95f5b8444f20fb32750e08634300', //token
    options: {
		'sonar.projectKey':'omnicia-web',
		'sonar.projectName':'omnicia-web',
		'sonar.projectVersion':'0.3', // this is the name and version displayed in the SonarQube UI.
		'sonar.sources': 'src/', //Path is relative to the sonar-project.properties file. Replace "\" by "/" on Windows.
		'sonar.sourceEncoding':'UTF-8', //# Encoding of the source code. Default is default system encoding
		'sonar.exclusions':'**/node_modules/**', //node_module folders which needs to be execlude
		'sonar.javascript.file.suffixes':'.js,.jsx' //checking on js as well as JSX files.
    }
  },
  () => {}
)
