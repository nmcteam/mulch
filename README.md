*Note* This project is in a very early state. It works great as-is since it's a dev tool, but we would love contributions/suggestions to make it work even better.

# Mulch

Mulch is a gulp recipe for compiling twig templates and preprocessor styles and then serving the compiled site while developing. It features Twig (twig.js, with designed-in support for JSON data retrieval), LESS/SASS, CSS minification, JS compilation and BrowserSync. It's a great starting point for frontend projects that run on PHP backends that use Twig. (Craft CMS, Drupal 8, Symfony, HiFi, etc). It makes it easy to develop the frontend of those projects without running a whole server. Because it has BrowserSync, as soon as changes are made to your source files, those are instantly reflected in the browser without the need to click refresh!

## How to install

You'll first need to install Node (if you don't know whether or not you have node, run `node -v`). Once that is installed, `cd` to Mulch's directory and run

`npm install`

to install all of Mulch's dependencies.

Note that OSX users may need to run it as `sudo npm install` (you'll know because you'll get "try again as sudo" errors). For info on removing the sudo requirement from node package installation in OSX, check out [
How to use npm global without sudo on OSX](http://www.johnpapa.net/how-to-use-npm-global-without-sudo-on-osx/) by [@joshpapa](https://github.com/johnpapa)

## How to use

A single line will get Mulch up and running. `cd`'d to Mulch's directory, run

`gulp mulch` (and see "Options", below)

This will compile all of the assets and launch BrowserSync. Your browser should open and display the src/templates/urls/index.html page (now compiled to compiled/index.html).

For as long as you leave this process running, all of your project assets will be watched and as soon as they are changed you'll see the changes in your browser!

## Project Structure

There are two main folders in the project:

* src - This holds all of your source files. Some sample ones are in place.
* compiled - Once you execute mulch this will be created and it holds all of the compiled assets and html pages. This is also where BrowserSync looks to serve content. If you need images, you'll need to put them in here.

### Twig Structure

The most interesting folder in src is "templates". This is where all the twig templates go. Inside this directory is a "urls" folder. Every template in this folder will be treated as an accessible URL by BrowserSync once things are compiled. So if you want an /about.html page, create "templates/urls/about.html". It also uses subfolders correctly so "templates/urls/about/team.html" will show up at /about/team.html.

### Data Folder

This folder can contain any number of valid json files. These will be made available to all twig templates indexed against their filename. So a file named "foo.json" would be available in the templates with {{ foo }}. This is a helpful way to inject/use some data from a project you are mocking up.

### Styles Folder

The target file will be the top-level all.less, all.scss, or all.sass. This can @include any other files you wish to use. By default (`gulp mulch`), all.less will be used; override this by running `gulp sass mulch` or `gulp scss mulch`.

### Scripts Folder

All scripts in the scripts folder are compiled and minified, in alphabetical order. The scripts in the /libs subdirectory are added first.

## All commands

Each sub-task is available via gulp if you wish to run them independently. They are:

* **browser-sync** - Launches BrowserSync
* **twig** - Compiles all json data files, and then compiles all twig templates
* **styles** - Compiles stylesheet files
* **scripts** - Compiles all scripts
* **mulch-compile** - Compiles all assets in the correct order (less, scripts, twig). Useful if you're using this recipe without BrowserSync
* **mulch** - Compiles all assets, launches BrowserSync and then watches files for changes

###Options
These commands are pseudo-options. Run just one, before **mulch** (`gulp option mulch`)
* **sass** - Tells mulch to use src/styles/all.sass
* **sass** - Tells mulch to use src/styles/all.scss