IQXWeb Installation

1. Install and configure IQXHub. IQXHub is configured by IQX.ini - sample settings should be available, and from the configuration settings in IQX - Maintenance - IQXNet Setup. It can run either as a service or as a visible console (they use the same config settings and do the same job). Ideally use the visual console until everything is running, since it is easier to see what is going on, and then use the service for live use.
The service is installed by running
  IQXHubService /install

2. Install NodeJS from https://nodejs.org

3. Ensure NodeJS is in the system path - this may involve re-booting the machine after installing it.

4. Unzip IQXWeb into a suitable folder - open a command prompt in that folder.

5. Run install.bat. This will use npm - the Node Package Manager - to install required library code.

6. Copy config_sample.js to config.js and edit the settings appropriately.

7. IQXWeb can also run either as a service or as a visible console. 
To install the service run 
  node serviceInstall.js
then manage it like any service from the Windows Service console. 
For the visible version run IQXWeb.bat
