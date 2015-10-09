module.exports={
  secret: 'GBR631TD69JT0189601750',      // For signing the authentication token
  iqxHubURL: 'http://localhost:54000/',  // Must have trailing slash - e.g. 'http://localhost:54000/'
  publicPort: 3000,                      // The outward facing http web server port - 0 to disable
  publicSecurePort: 0,                   // The outward facing https web server port - 0 to disable
  // For secure comms you need key.pem and cert.pem with your security certificate in the server.js folder
  passwordToForceChange: 'password',     // If this password is used it will force an immediate change on login
  clientParams:{
    browserTitle: 'IQX Web',                  // The browser caption bar
    headerName: 'IQX Web',                    // Appears on the page header if no logoFile
    footerText: 'Copyright IQX Limited 2015', // Appears on the page footer
    logoFile: '/sitelogo.png',                // The logo for the page header
    logoAlt: 'IQXWeb'                         // Alternative text if logo file not found
    }
  }
    
