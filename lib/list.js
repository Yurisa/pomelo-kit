const chalk = require('chalk');
const templates = require('../templates');

module.exports = () => {
  if(!templates.list || templates.list.length == 0){
    console.log(chalk.yellow('当前无可用模板'))
  }
  const { list } = templates;
  for (const key in list) {
    if (list.hasOwnProperty(key)) {
      const t = list[key];
      console.log(
        '  ' + chalk.green('*') +
        '  ' + chalk.green(t.name) +
        ' -' + t.desc);
    }
  }
}