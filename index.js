// vars

let num = 120
//var tier = Math.abs(num) > 999 ? 


	const Discord = require("discord.js")
const client = new Discord.Client()
require('discord-reply');
const data = require("./data.json")
const Token = process.env.token
const fs = require("fs")
const prefix = "!"
require('discord-buttons')(client);
const disbut = require("discord-buttons");
const messages = {}
const deletes = {}


// express

const express = require("express")
const app = express()

app.get("/", (req,res) => {
  res.send("Uptime")
})

app.listen(3030)



// Functions


function fetch(url, options = {}) {
	const https = require('https');
	const http = require('http');
	return new Promise((resolve, reject) => {
		try{
	  if (!url) return reject(new Error('Url is required'));
  
	  const { body, method = 'GET', ...restOptions } = options;
	  const client = url.startsWith('https') ? https : http;
  
	  const request = client.request(url, { method, ...restOptions }, (res) => {
		let chunks = '';
  
		res.setEncoding('utf8');
  
		res.on('data', (chunk) => {
		  chunks += chunk;
		});
  
		res.on('end', () => {
		  resolve({ statusCode: res.statusCode, body: chunks });
		});
	  })
  
	  request.on('error', (err) => {
		reject(err);
	  });
  
	  if (body) {
		request.setHeader('Content-Length', body.length);
		request.write(body);
	  }
	  request.end()
	}catch{

	}
	});
  }


const stringIsAValidUrl = (url) => {
	var m = false
	try {
		new URL(url);
		m = true
	  } catch {
		m = false
	  }
	  return m
  };



const CreateEmbed = (title,desc,color) => {
	const Embed = new Discord.MessageEmbed()
		.setTitle(title)
		.setDescription(desc)
		.setColor(color)
	return Embed
}

// Uptime


setInterval(() => {
	for(const key in data){
		fetch(data[key].url).catch(() => {})
	}
},10000)

// Ready


client.on("ready", () =>{
    console.log(`Logged in as ${client.user.tag}!`);
	client.user.setActivity(`${prefix}help`, { type: "PLAYING" });
 });


// Events

client.on("message", message => {
	if(message.content != prefix + "help") return
	message.channel.send(CreateEmbed("Help",`
  > ${prefix}help => To see the help list
  > ${prefix}uptime [\`url\`] => To upload the link on uptime
  > ${prefix}delete [\`url\`] => To remove the link from uptime
  > ${prefix}my-urls => To see the links I uploaded on Uptime
  > ${prefix}get [\`id\`] => To fetch information about the ID `,"GREEN"))
  })

 client.on("message", message => {
	 if(!message.content.startsWith(prefix + "uptime")) return
	 const url = message.content.split(" ")[1]
	 if(!url) return message.channel.send(CreateEmbed("Error ❌",`Please enter url Example:\n**${prefix}uptime https://example.com**`,"RED")).catch(() => {})
	 if(stringIsAValidUrl(url) === false) return message.channel.send(CreateEmbed("Error ❌","Url is not correct please enter correct url","RED")).catch(() => {})
	 var check = true
	 for(const key in data){
		 if(data[key].url === url) check = false
	 }
	 if(!check) return message.channel.send(CreateEmbed("Error ❌",`Url has Already exists in uptime`,"RED")).catch(() => {})
	 function getId(len){
			var text = "";

			var charset = "abcdefghijklmnopqrstuvwxyzQWERTYUIOPASDFGHJKLZXCVBNM0123456789";

			for( var i=0; i < len; i++ )
				text += charset.charAt(Math.floor(Math.random() * charset.length));

			return text;
	}
	const id = getId(40)
	data[id] = {
		url: url,
		owner: message.author.id,
		time: new Date().getTime()
	}
	fs.writeFile("./data.json", JSON.stringify(data, null, 2), function(err) {
		if (err) console.log;
	  });
	message.delete().catch(() => {})
	message.channel.send(CreateEmbed("successful ✔",`<@!${message.author.id}> Done add Url in uptime 24/8`,"GREEN")).catch(() => {})
	message.author.send(CreateEmbed("New url",`Done added new url: **${url}**\nId: \`${id}\``,"GREEN")).catch(() => {})
 })

 client.on("message", message => {
	 if(!message.content.startsWith(prefix + "get")) return
	 const id = message.content.split(" ")[1]
	 if(!id) return message.channel.send({content: CreateEmbed("Error ❌",`Please enter url id Example:\n**${prefix}get \`UX0apH8tnh5IGc9HcZPr4psIh1M9YddDXwsnmSc4\`**`)}).catch(() => {})
	 var url = false;
	 for(const key in data){
		 if(key === id && data[key].owner === message.author.id) {
			const date = new Date(data[key].time)
			 url = { url: data[key].url, time: `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()} | ${date.getHours()}:${date.getMinutes()}` }
		 }
	 }
	 if(!url) return message.channel.send({content: CreateEmbed("Error ❌","Sorry, But your don't have any url with this id","RED")}).catch(() => {})
	 var deleteBtn = new disbut.MessageButton()
		.setLabel("delete message")
		.setEmoji("⛔")
		.setID("deleteMsg")
		.setStyle("red");
	let row = new disbut.MessageActionRow()
        .addComponents(deleteBtn);
	 message.channel.send({content: CreateEmbed("Url info:",`Url: **${url.url}**\nTime: **${url.time}**`,"GREEN"),components:[row]}).then(msg => {
		messages[msg.id] = {owner: message.author.id,msg: msg.id}
	 }).catch(() => {})
 })

 client.on("message", message => {
	if(message.content != (prefix + "my-urls")) return
    var deleteBtn = new disbut.MessageButton()
		.setLabel("delete message")
		.setEmoji("⛔")
		.setID("deleteMsg")
		.setStyle("red");
	let row = new disbut.MessageActionRow()
        .addComponents(deleteBtn);
	var urls = []
	for(const key in data){
		if(data[key].owner === message.author.id) {
			const date = new Date(data[key].time) 
			urls.push({url: data[key].url, time: `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()} | ${date.getHours()}:${date.getMinutes()}`, id: key})
		}
	}
	if(urls.length === 0) return message.channel.send({content: CreateEmbed("Your Urls:","Sorry but your don't have any url 😢","RED")})
	message.channel.send({content: CreateEmbed("Your Urls:",`${urls.map(d => `Url: **${d.url}**\nId: \`${d.id}\`\nTime: **${d.time}**\n------------------\n`).join("")}`,"GREEN"), components: [row]}).then(msg => {
		messages[msg.id] = {owner: message.author.id,msg: msg.id}
	}).catch(() => {})
 })


 client.on("message", message => {
	 if(!message.content.startsWith(prefix + "delete")) return
	 const url = message.content.split(" ")[1]
	 if(!url) return message.channel.send(CreateEmbed("Error ❌",`Please enter url Example:\n**${prefix}delete https://example.com**`,"RED")).catch(() => {})
	 var check = false
	 for(const key in data){
		 if(data[key].owner === message.author.id && data[key].url === url) check = true
	 }
	 if(!check) return message.channel.send(CreateEmbed("Error ❌",`Url Not found in Your uptime`,"RED")).catch(() => {})
	 var sure = new disbut.MessageButton()
		.setLabel("Sure")
		.setID("sure")
		.setStyle("green");
	var notsure = new disbut.MessageButton()
		.setLabel("Not Sure")
		.setID("notsure")
		.setStyle("red");
	let row = new disbut.MessageActionRow()
        .addComponents(sure,notsure);
	message.channel.send({content: CreateEmbed("Confirm..",`Are you sure to remove this link \`${url}\` from Uptime?`,"BLUE"),components: [row]}).then(msg => {
		deletes[msg.id] = {
			owner: message.author.id,
			id: msg.id,
			url: url
		}
	})
 })



// Button Click

client.on("clickButton", button => {
	if(button.id === "deleteMsg"){
		if(!messages[button.message.id]) return button.reply.send({content: "Sorry but this message not found", ephemeral: true}).catch(() => {})
		if(messages[button.message.id].owner != button.clicker.id) return button.reply.send({content: "Sorry but you can't press this button", ephemeral: true}).catch(() => {})
		button.message.delete().catch(() => {})
		delete messages[button.message.id]
		button.reply.send({content: "Done delete message 👍", ephemeral: true}).catch(() => {})
	}else if(button.id === "sure"){
		if(!deletes[button.message.id]) return button.reply.send({content: "Sorry but this message not found", ephemeral: true}).catch(() => {})
		if(deletes[button.message.id].owner != button.clicker.id) return button.reply.send({content: "Sorry but you can't press this button", ephemeral: true}).catch(() => {})
		for(const key in data){
			if(data[key].owner === button.clicker.id && data[key].url === deletes[button.message.id].url) delete data[key]
		}
		fs.writeFile("./data.json", JSON.stringify(data, null, 2), function(err) {
			if (err) console.log;
		  });
		button.message.edit({content: CreateEmbed("successful","Done delete url","GREEN"),components: []}).catch(() => {})
	}else if(button.id === "notsure"){
		if(!deletes[button.message.id]) return button.reply.send({content: "Sorry but this message not found", ephemeral: true}).catch(() => {})
		if(deletes[button.message.id].owner != button.clicker.id) return button.reply.send({content: "Sorry but you can't press this button", ephemeral: true}).catch(() => {})
		button.message.edit({content: CreateEmbed("fail","The operation has been cancelled","RED"),components: []})
	}else{
		button.reply.defer()
	}
})

// login

client.login(Token)
