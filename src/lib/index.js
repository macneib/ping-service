const nats = require('nats');
import config from '../config/environment';


export default function activateNats() {

const url =  config.nats.DEFAULT_URI;
// const creds = v.creds;
// const subject = argv._[0];
const subject = 'foo';

if (!subject) {
    console.log('Usage: node-sub [-s server] [--creds file] <subject>');
    process.exit();
}

// Connect to NATS server.
const nc = nats.connect(url, {json: true});




nc.on('connect', function() {

    nc.on('error', function(err) {
        console.log(err);
    });

    nc.subscribe("greeting", function(msg, reply) {
        // msg is a parsed JSON object object
        if(msg.name && msg.reply) {
            nc.publish(reply, {greeting: "hello " + msg.name});
        }
    });

    // As with all inputs from unknown sources, if you don't trust the data
    // you should verify it prior to accessing it. While JSON is safe because
    // it doesn't export functions, it is still possible for a client to
    // cause issues to a downstream consumer that is not written carefully
    nc.subscribe("unsafe", function(msg) {
        // for example a client could inject a bogus `toString` property
        // which could cause your client to crash should you try to
        // concatenation with the `+` like this:
        // console.log("received", msg + "here");
        // `TypeError: Cannot convert object to primitive value`
        // Note that simple `console.log(msg)` is fine.
        if (msg.hasOwnProperty('toString')) {
            console.log('tricky - trying to crash me:', msg.toString);
            return;
        }
    
        // of course this is no different than using a value that is
        // expected in one format (say a number), but the client provides
        // a string:
        if (isNaN(msg.amount) === false) {
            // do something with the number
        }
        //...
    });


// "*" matches any token, at any level of the subject.
nc.subscribe('foo.*.baz', function(msg, reply, subject) {
    console.log('Msg received on [' + subject + '] : ' + msg);
  });
  
  nc.subscribe('foo.bar.*', function(msg, reply, subject) {
    console.log('Msg received on [' + subject + '] : ' + msg);
  });
  
  // ">" matches any length of the tail of a subject, and can only be
  // the last token E.g. 'foo.>' will match 'foo.bar', 'foo.bar.baz',
  // 'foo.foo.bar.bax.22'
  nc.subscribe('foo.>', function(msg, reply, subject) {
    console.log('Msg received on [' + subject + '] : ' + msg);
  });

    // the bad guy
    nc.publish("unsafe", {toString: "no good"});

    nc.flush(function() {
        nc.close();
    });
});
}