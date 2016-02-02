set PATH=%PATH%;C:\Program Files\7-Zip\
del IQXWeb.zip
7z a IQXWeb.zip server.js install.bat iqxWeb.bat package.json serviceInstall.js config_sample.js readme.txt
7z a IQXWeb.zip views
7z a IQXWeb.zip jobs -x!jobs\test*
7z a IQXWeb.zip assets -x!assets\custom -x!assets\maps
7z a IQXWeb.zip srvControllers  -x!srvControllers\custom
