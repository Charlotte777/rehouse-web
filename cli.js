const execa = require('execa');
const argv = require('yargs-parser')(process.argv.slice(2));
const cliName = process.env.npm_lifecycle_event;
const api = (cliName || '').split('-').slice(1, (cliName || '').length).join('-');
console.log(api,'api');
const {REACT_APP_API_ENV, build} = argv;
const env = {
  HOST: build ? undefined : 'local-house.com',
  PORT: build ? undefined : '10000',
  REACT_APP_API_ENV: REACT_APP_API_ENV || api,
  SKIP_PREFLIGHT_CHECK: build ? true : undefined
};

(async () => {
  console.log(env, '打印当前环境变量');
  console.log(`react-app-rewired ${build ? 'build' : 'start'}`, '执行打包脚本');
  const subprocess = execa.command(`react-app-rewired ${build ? 'build' : 'start'}`, {env});
  subprocess.stdout.pipe(process.stdout);
})();
