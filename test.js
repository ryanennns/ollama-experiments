const { exec } = require('child_process');

exec('dir', (err, stdout, stderr) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(stdout);
}