# Build Vault for distro

# First, bundle backend server
server_exec=$(mktemp -d)/vaultDB
platform=$(rustc -Vv | grep host | cut -f2 -d' ')
db_bin=${server_exec}-${platform}

# (build)
cd server
echo "Building to ${db_bin}"
npm run build -- --outfile $db_bin
echo "Moving DB binary to the client"
mv $db_bin ../client/src-tauri/binaries
cd -

# (build frontend app with DB packed)
echo "Building frontend app"
cd client
npm run build
npm run tauri build

echo "Done."