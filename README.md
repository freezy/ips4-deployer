# IPS4 Deployer

*Deploy an IPS4 app through command line.*

## Summary

This allows you to automate the installation or upgrade of an IPS4 application.
It can be used in a continuous integration setup or a `post-receive` hook, 
allowing git push deployments without having to log into AdminCP.

## Usage

You'll need Node.js 8+ on your system. General usage is:

	node index.js --url=[url] --username=[username] --password=[password] --app=[app id] --action=[install|upgrade]

Where:

- `url` is the link to your IPS board, e.g. `https://someforum.com/`
- `username` and `password` are the admin credentials
- `app` is the name of the app you want to deploy
- `action` is whether the app should be freshly installed or upgraded.

In case the app is behind HTTP simple authentication, you can pass `user:password`
to the `--auth` parameter.

Note that this doesn't actually copy the the app to the IPS application folder,
it assumes that has already been done. This makes it possible to deploy any app
without shell access on the actual server.

An example for a git hook can be found [here](/freezy/ips4-deployer/blob/master/post-receive).

## License

GPLv2, see [LICENSE](LICENSE).
