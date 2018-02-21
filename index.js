const puppeteer = require('puppeteer');

const argv = require('yargs')
	.usage('Usage: $0 --url=[url] --username=[username] --password=[password] --app=[app to deploy] --action=[install|upgrade]')
	.option('url', { describe: 'URL of the IPS board without /admin suffix.' })
	.option('username', { alias: 'u', describe: 'Admin username' })
	.option('password', { alias: 'p', describe: 'Admin password' })
	.option('app', { alias: 'a', describe: 'Name of the app to deploy' })
	.option('action', { describe: 'Install or upgrade' })
	.option('auth', { describe: 'Simple authentication, username:password' })
	.option('screenshots', { describe: 'Take a screenshot on error or success' })
	.choices('action', ['install', 'upgrade'])
	.default('action', 'upgrade')
	.default('screenshots', false)
	.demandOption(['url', 'username', 'password', 'app'])
	.argv;

(async () => {
	const url = argv.url.endsWith('/') ? argv.url : argv.url + '/';
	const adminUrl = url + 'admin/';
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	try {

		// set simple auth header if set
		if (argv.auth) {
			console.log('Setting auth headers...');
			await page.setExtraHTTPHeaders({ Authorization: `Basic ${new Buffer(argv.auth).toString('base64')}` });
		}

		// load page
		console.log('Opening page at %s...', adminUrl);
		await page.goto(adminUrl, { waitUntil: 'load' });

		// enter login details
		console.log('Logging in as %s...', argv.username);
		await page.click('#elInput_auth');
		await page.keyboard.type(argv.username);
		await page.click('#elInput_password');
		await page.keyboard.type(argv.password);

		// login
		await page.click('button[type="submit"].ipsButton_primary');
		await page.waitForNavigation();

		// deploy
		console.log('%s app %s...', argv.action === 'install' ? 'Installing' : 'Upgrading', argv.app);
		const dashboardUrl = await page.url();
		await page.goto(dashboardUrl + '&app=core&module=applications&controller=applications&do=' + argv.action + '&appKey=' + argv.app, { waitUntil: 'load' });
		await page.waitForFunction('!window.location.href.includes("appKey")');
		if (argv.screenshots) {
			await page.screenshot({ path: 'deployed.png' });
		}

		console.log('Done!');
		await browser.close();

	} catch (err) {
		if (argv.screenshots) {
			await page.screenshot({ path: 'error.png' });
		}
		console.log('ERROR: ', err);
		await browser.close();
		process.exit(1);
	}
})();
