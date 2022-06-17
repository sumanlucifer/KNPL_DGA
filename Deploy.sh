SPACE="DGA"
VER=mta_archives/knpl-dga-web_0.0.1.mtar

#Login to CF space
cf login -a https://api.cf.ap11.hana.ondemand.com -u ankit.pundhir@extentia.com -p Admin2022 -o "Kansai Nerolac Paints Ltd_KNPL-QAS-PROJECTS" -s "${SPACE}"

echo "Building Project"
mbt build -s '/home/user/projects/knpl-dga-web'

if [[ $? -eq 0 ]]; then
    echo "build complete Now deploying"
    cf deploy $VER --delete-services
    git reset --hard
else
    echo "corrupt MTA file please check."
fi  
