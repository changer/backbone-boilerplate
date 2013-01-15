# Boilerplate for Backbone + LayoutManager and common libraries

### Getting started

Clone a copy of our empty project setup:

```
git clone git@github.com:rubenstolk/backbone-boilerplate-project.git my-project
cd your-project
rm -rf .git
echo '# My new project' > README.md
git init
git commit -m "My commit to my-project"
git submodule update --init --recursive
```

This will take a while as all libraries will be cloned from Github.

Now you can start building your app!

# Happy coding

# Upgrade layoutmanager 0.6.6 to 0.7.5:

- change paths: { ... } to prefix: '...' in app.js
- merge layouts folder with templates folder (layout templates now to be in root of templates)
