//  Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
//  or more contributor license agreements. Licensed under the Elastic License;
//  you may not use this file except in compliance with the Elastic License.

function DeviceProcessor() {
	var builder = new processor.Chain();
	builder.Add(save_flags);
	builder.Add(strip_syslog_priority);
	builder.Add(chain1);
	builder.Add(populate_fields);
	builder.Add(restore_flags);
	var chain = builder.Build();
	return {
		process: chain.Run,
	}
}

var dup1 = call({
	dest: "nwparser.payload",
	fn: STRCAT,
	args: [
		field("messageid"),
		constant(": "),
		field("p0"),
	],
});

var dup2 = match("MESSAGE#0:cli/0", "nwparser.payload", "%{agent}[%{process_id}]: \u003c\u003c-%{fld20}.%{severity}> %{username}@%{p0}");

var dup3 = match_copy("MESSAGE#0:cli/2", "nwparser.p0", "action");

var dup4 = setc("eventcategory","1605000000");

var dup5 = setf("msg","$MSG");

var dup6 = setc("event_description","bad variable");

var dup7 = setc("event_description","This file is automatically generated");

var dup8 = setc("eventcategory","1603000000");

var dup9 = setc("event_description","authentication failure");

var dup10 = match("MESSAGE#10:cli:pam", "nwparser.payload", "%{agent}[%{process_id}]: %{fld21}(%{fld1}:%{fld2}): pam_putenv: %{fld3}", processor_chain([
	dup4,
	dup5,
	dup6,
]));

var hdr1 = match("HEADER#0:0001", "message", "%{messageid}[%{hfld1}]: %{p0}", processor_chain([
	setc("header_id","0001"),
	call({
		dest: "nwparser.payload",
		fn: STRCAT,
		args: [
			field("messageid"),
			constant("["),
			field("hfld1"),
			constant("]: "),
			field("p0"),
		],
	}),
]));

var hdr2 = match("HEADER#1:0002", "message", "%{messageid}: %{p0}", processor_chain([
	setc("header_id","0002"),
	dup1,
]));

var hdr3 = match("HEADER#2:0003", "message", "%{hfld1->} %{hfld2->} %{hfld3->} %{hfld4->} %{messageid}[%{hfld5}]: %{p0}", processor_chain([
	setc("header_id","0003"),
	call({
		dest: "nwparser.payload",
		fn: STRCAT,
		args: [
			field("messageid"),
			constant("["),
			field("hfld5"),
			constant("]: "),
			field("p0"),
		],
	}),
]));

var hdr4 = match("HEADER#3:0004", "message", "%{hfld1->} %{hfld2->} %{hfld3->} %{hfld4->} %{messageid}: %{p0}", processor_chain([
	setc("header_id","0004"),
	dup1,
]));

var select1 = linear_select([
	hdr1,
	hdr2,
	hdr3,
	hdr4,
]);

var part1 = match("MESSAGE#0:cli/1_0", "nwparser.p0", "::%{fld5}:%{saddr->} : Processing command: %{p0}");

var part2 = match("MESSAGE#0:cli/1_1", "nwparser.p0", "%{domain->} : Processing command: %{p0}");

var select2 = linear_select([
	part1,
	part2,
]);

var all1 = all_match({
	processors: [
		dup2,
		select2,
		dup3,
	],
	on_success: processor_chain([
		dup4,
		dup5,
	]),
});

var msg1 = msg("cli", all1);

var part3 = match("MESSAGE#1:cli:01/1_0", "nwparser.p0", "::%{fld5}:%{saddr->} : Processing command %{p0}");

var part4 = match("MESSAGE#1:cli:01/1_1", "nwparser.p0", "%{domain->} : Processing command %{p0}");

var select3 = linear_select([
	part3,
	part4,
]);

var all2 = all_match({
	processors: [
		dup2,
		select3,
		dup3,
	],
	on_success: processor_chain([
		dup4,
		dup5,
	]),
});

var msg2 = msg("cli:01", all2);

var part5 = match("MESSAGE#2:cli:02/1_0", "nwparser.p0", "::%{fld5}:%{saddr->} : Leaving config mode");

var part6 = match("MESSAGE#2:cli:02/1_1", "nwparser.p0", "%{domain->} : Leaving config mode");

var select4 = linear_select([
	part5,
	part6,
]);

var all3 = all_match({
	processors: [
		dup2,
		select4,
	],
	on_success: processor_chain([
		dup4,
		dup5,
		setc("event_description","Leaving config mode"),
	]),
});

var msg3 = msg("cli:02", all3);

var part7 = match("MESSAGE#3:cli:03/1_0", "nwparser.p0", "::%{fld5}:%{saddr->} : Entering config mode");

var part8 = match("MESSAGE#3:cli:03/1_1", "nwparser.p0", "%{domain->} : Entering config mode");

var select5 = linear_select([
	part7,
	part8,
]);

var all4 = all_match({
	processors: [
		dup2,
		select5,
	],
	on_success: processor_chain([
		dup4,
		dup5,
		setc("event_description","Entering config mode"),
	]),
});

var msg4 = msg("cli:03", all4);

var part9 = match("MESSAGE#4:cli:04/1_0", "nwparser.p0", "::%{fld5}:%{saddr->} : CLI exiting");

var part10 = match("MESSAGE#4:cli:04/1_1", "nwparser.p0", "%{domain->} : CLI exiting");

var select6 = linear_select([
	part9,
	part10,
]);

var all5 = all_match({
	processors: [
		dup2,
		select6,
	],
	on_success: processor_chain([
		dup4,
		dup5,
		setc("event_description","CLI exiting"),
	]),
});

var msg5 = msg("cli:04", all5);

var part11 = match("MESSAGE#5:cli:05/1_0", "nwparser.p0", "::%{fld5}:%{saddr->} : CLI launched");

var part12 = match("MESSAGE#5:cli:05/1_1", "nwparser.p0", "%{domain->} : CLI launched");

var select7 = linear_select([
	part11,
	part12,
]);

var all6 = all_match({
	processors: [
		dup2,
		select7,
	],
	on_success: processor_chain([
		dup4,
		dup5,
		setc("event_description","CLI launched"),
	]),
});

var msg6 = msg("cli:05", all6);

var part13 = match("MESSAGE#6:Automatically/1_0", "nwparser.p0", "::%{fld5}:%{saddr->} : Automatically logged out due to keyboard inactivity.");

var part14 = match("MESSAGE#6:Automatically/1_1", "nwparser.p0", "%{domain->} : Automatically logged out due to keyboard inactivity.");

var select8 = linear_select([
	part13,
	part14,
]);

var all7 = all_match({
	processors: [
		dup2,
		select8,
	],
	on_success: processor_chain([
		dup4,
		setc("ec_subject","User"),
		setc("ec_activity","Logoff"),
		dup5,
		setc("event_description","Automatically logged out due to keyboard inactivity"),
	]),
});

var msg7 = msg("Automatically", all7);

var part15 = match("MESSAGE#7:cli:06/1_0", "nwparser.p0", "::%{fld5}:%{saddr->} : Entering enable mode");

var part16 = match("MESSAGE#7:cli:06/1_1", "nwparser.p0", "%{domain->} : Entering enable mode");

var select9 = linear_select([
	part15,
	part16,
]);

var all8 = all_match({
	processors: [
		dup2,
		select9,
	],
	on_success: processor_chain([
		dup4,
		dup5,
		setc("event_description","Entering enable mode"),
	]),
});

var msg8 = msg("cli:06", all8);

var part17 = match("MESSAGE#8:cli:07/1_0", "nwparser.p0", "::%{fld5}:%{saddr->} : Leaving enable mode");

var part18 = match("MESSAGE#8:cli:07/1_1", "nwparser.p0", "%{domain->} : Leaving enable mode");

var select10 = linear_select([
	part17,
	part18,
]);

var all9 = all_match({
	processors: [
		dup2,
		select10,
	],
	on_success: processor_chain([
		dup4,
		dup5,
		setc("event_description","Leaving enable mode"),
	]),
});

var msg9 = msg("cli:07", all9);

var part19 = match("MESSAGE#9:Processing/1_0", "nwparser.p0", "::%{fld5}:%{saddr->} : Processing a secure command...");

var part20 = match("MESSAGE#9:Processing/1_1", "nwparser.p0", "%{domain->} : Processing a secure command...");

var select11 = linear_select([
	part19,
	part20,
]);

var all10 = all_match({
	processors: [
		dup2,
		select11,
	],
	on_success: processor_chain([
		dup4,
		dup5,
		setc("event_description","Processing a secure command"),
	]),
});

var msg10 = msg("Processing", all10);

var msg11 = msg("cli:pam", dup10);

var select12 = linear_select([
	msg1,
	msg2,
	msg3,
	msg4,
	msg5,
	msg6,
	msg7,
	msg8,
	msg9,
	msg10,
	msg11,
]);

var part21 = match("MESSAGE#11:schedulerd", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> Executing Job \"%{operation_id}\" execution %{fld6}", processor_chain([
	dup4,
	dup5,
]));

var msg12 = msg("schedulerd", part21);

var part22 = match("MESSAGE#12:schedulerd:01", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> System time changed, recomputing job run times.", processor_chain([
	dup4,
	dup5,
	setc("event_description","System time changed, recomputing job run times"),
]));

var msg13 = msg("schedulerd:01", part22);

var select13 = linear_select([
	msg12,
	msg13,
]);

var part23 = match("MESSAGE#13:configd:Rotating", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> Rotating out backup file \"%{filename}\" for device \"%{hostname}\".", processor_chain([
	dup4,
	dup5,
]));

var msg14 = msg("configd:Rotating", part23);

var part24 = match("MESSAGE#14:configd:Deleting", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> Deleting backup %{filename->} from device \"%{hostname}\"", processor_chain([
	dup4,
	dup5,
]));

var msg15 = msg("configd:Deleting", part24);

var part25 = match("MESSAGE#15:configd", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> Device \"%{hostname}\" completed command(s) \u003c\u003c%{action}> ...", processor_chain([
	dup4,
	dup5,
]));

var msg16 = msg("configd", part25);

var part26 = match("MESSAGE#16:configd:01", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> %{username}@::%{fld5}:%{saddr}-%{fld6}: Sending commands to Device %{hostname}", processor_chain([
	dup4,
	dup5,
]));

var msg17 = msg("configd:01", part26);

var part27 = match("MESSAGE#17:configd:11", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> %{username}@%{fld6}: Sending commands to Device %{hostname}", processor_chain([
	dup4,
	dup5,
]));

var msg18 = msg("configd:11", part27);

var part28 = match("MESSAGE#18:file", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> %{username}@::%{fld5}:%{saddr}-%{fld6}: command: %{action->} ;; CPL generated by Visual Policy Manager: %{fld10->} ;%{fld11->} ; %{fld12->} ; %{info}", processor_chain([
	dup4,
	dup5,
	dup7,
]));

var msg19 = msg("file", part28);

var part29 = match("MESSAGE#19:configd:02", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> %{username}@::%{fld5}:%{saddr}-%{fld6}: command: %{action}", processor_chain([
	dup4,
	dup5,
]));

var msg20 = msg("configd:02", part29);

var part30 = match("MESSAGE#20:configd:22", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> %{username}@%{fld6}: command: %{action}", processor_chain([
	dup4,
	dup5,
]));

var msg21 = msg("configd:22", part30);

var part31 = match("MESSAGE#21:configd:03", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> %{username}@::%{fld5}:%{saddr}-%{fld6}: Commands sent to Device %{hostname}", processor_chain([
	dup4,
	dup5,
]));

var msg22 = msg("configd:03", part31);

var part32 = match("MESSAGE#22:configd:33", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> %{username}@%{fld6}: Commands sent to Device %{hostname}", processor_chain([
	dup4,
	dup5,
]));

var msg23 = msg("configd:33", part32);

var part33 = match("MESSAGE#23:Backup", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> Backup import command finished for all devices.", processor_chain([
	dup4,
	dup5,
	setc("event_description","Backup import command finished for all devices"),
]));

var msg24 = msg("Backup", part33);

var part34 = match("MESSAGE#24:Beginning", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> Beginning to make backup of cache %{hostname}", processor_chain([
	dup4,
	dup5,
	setc("event_description","Beginning to make backup of cache"),
]));

var msg25 = msg("Beginning", part34);

var part35 = match("MESSAGE#25:Inputting", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> Inputting overlay \u003c\u003c%{fld10}>", processor_chain([
	dup4,
	dup5,
	setc("event_description","Inputting overlay"),
]));

var msg26 = msg("Inputting", part35);

var part36 = match("MESSAGE#26:Saved", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> Saved %{info->} to %{filename}", processor_chain([
	dup4,
	dup5,
]));

var msg27 = msg("Saved", part36);

var part37 = match("MESSAGE#27:Importing", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> Importing overlay \u003c\u003c%{fld25}> from %{hostname}", processor_chain([
	dup4,
	dup5,
]));

var msg28 = msg("Importing", part37);

var part38 = match("MESSAGE#28:Overlay", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> Overlay \"%{fld25}\" imported from device \"%{hostname}\"", processor_chain([
	dup4,
	dup5,
]));

var msg29 = msg("Overlay", part38);

var part39 = match("MESSAGE#29:Executed", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> Executed the last created overlay. The filename is %{filename}", processor_chain([
	dup4,
	dup5,
]));

var msg30 = msg("Executed", part39);

var part40 = match("MESSAGE#30:Configuration", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> Configuration system online", processor_chain([
	dup4,
	dup5,
	setc("event_description","Configuration system online"),
]));

var msg31 = msg("Configuration", part40);

var part41 = match("MESSAGE#31:Create", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> CREATE %{info}", processor_chain([
	dup4,
	dup5,
	setc("event_description","Table creation"),
]));

var msg32 = msg("Create", part41);

var part42 = match("MESSAGE#32:Loaded", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> Loaded config file initial", processor_chain([
	dup4,
	dup5,
	setc("event_description","Loaded config file initial"),
]));

var msg33 = msg("Loaded", part42);

var part43 = match("MESSAGE#33:Setting", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> Setting set-reply timeout to %{fld1}", processor_chain([
	dup4,
	dup5,
	setc("event_description","Setting set-reply timeout"),
]));

var msg34 = msg("Setting", part43);

var part44 = match("MESSAGE#34:CCD", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> CCD lost connection to device \"%{hostname}\": %{event_description}", processor_chain([
	dup4,
	dup5,
]));

var msg35 = msg("CCD", part44);

var part45 = match("MESSAGE#35:Device", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> Device \"%{hostname}\" is now online.", processor_chain([
	dup4,
	dup5,
]));

var msg36 = msg("Device", part45);

var part46 = match("MESSAGE#36:Output", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> %{username}@::%{fld5}:%{saddr}-%{fld6}: %{fld9->} Output for device \"%{hostname}\" %{fld10}", processor_chain([
	dup4,
	dup5,
]));

var msg37 = msg("Output", part46);

var part47 = match("MESSAGE#37:ssh", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> (ssh) %{event_description}", processor_chain([
	dup4,
	dup5,
]));

var msg38 = msg("ssh", part47);

var part48 = match("MESSAGE#38:Applying", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> %{username}@::%{fld5}:%{saddr}-%{fld6}: Applying overlay \u003c\u003c%{fld10}> to group %{group_object}", processor_chain([
	dup4,
	dup5,
	setc("event_description","Applying overlay to group"),
]));

var msg39 = msg("Applying", part48);

var part49 = match("MESSAGE#39:Applying:01", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> %{username}@::%{fld5}:%{saddr}-%{fld6}: Applying overlay \u003c\u003c%{fld10}> to cache %{hostname}", processor_chain([
	dup4,
	dup5,
	setc("event_description","Applying overlay to cache"),
]));

var msg40 = msg("Applying:01", part49);

var part50 = match("MESSAGE#40:configd:backup", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> Backup complete for device \"%{hostname}\". ID %{fld10}", processor_chain([
	dup4,
	dup5,
	setc("event_description","Backup complete for device"),
]));

var msg41 = msg("configd:backup", part50);

var part51 = match("MESSAGE#41:file:01", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> Device \"%{hostname}\" completed command(s) %{action->} ;; CPL generated by Visual Policy Manager: %{fld10->} ;%{fld11->} ; %{fld12->} ; %{info}", processor_chain([
	dup4,
	dup5,
	dup7,
]));

var msg42 = msg("file:01", part51);

var part52 = match("MESSAGE#42:configd:connection", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> read: Connection reset by peer", processor_chain([
	dup4,
	dup5,
	setc("event_description","Connection reset by peer"),
]));

var msg43 = msg("configd:connection", part52);

var part53 = match("MESSAGE#43:configd:failed", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> %{info->} failed", processor_chain([
	dup4,
	dup5,
	setc("event_description","cd session read failed"),
]));

var msg44 = msg("configd:failed", part53);

var select14 = linear_select([
	msg14,
	msg15,
	msg16,
	msg17,
	msg18,
	msg19,
	msg20,
	msg21,
	msg22,
	msg23,
	msg24,
	msg25,
	msg26,
	msg27,
	msg28,
	msg29,
	msg30,
	msg31,
	msg32,
	msg33,
	msg34,
	msg35,
	msg36,
	msg37,
	msg38,
	msg39,
	msg40,
	msg41,
	msg42,
	msg43,
	msg44,
]);

var part54 = match("MESSAGE#44:poller", "nwparser.payload", "%{agent}[%{process_id}]: \u003c\u003c%{fld20}.%{severity}> Querying content system for job results.", processor_chain([
	dup4,
	dup5,
	setc("event_description","Querying content system for job results"),
]));

var msg45 = msg("poller", part54);

var part55 = match("MESSAGE#45:heartbeat", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> Processing command: %{action}", processor_chain([
	dup4,
	dup5,
]));

var msg46 = msg("heartbeat", part55);

var part56 = match("MESSAGE#46:heartbeat:01", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> The HB command is %{action}", processor_chain([
	dup4,
	dup5,
]));

var msg47 = msg("heartbeat:01", part56);

var part57 = match("MESSAGE#47:heartbeat:02", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> director heartbeat client exiting.", processor_chain([
	dup4,
	dup5,
	setc("event_description","director heartbeat client exiting"),
]));

var msg48 = msg("heartbeat:02", part57);

var part58 = match("MESSAGE#48:heartbeat:03", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> director heartbeat client launched.", processor_chain([
	dup4,
	dup5,
	setc("event_description","director heartbeat client launched"),
]));

var msg49 = msg("heartbeat:03", part58);

var part59 = match("MESSAGE#49:heartbeat:crit1", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> %{filename}: undefined symbol: %{info}", processor_chain([
	dup4,
	dup5,
	setc("event_description","undefined symbol"),
]));

var msg50 = msg("heartbeat:crit1", part59);

var part60 = match("MESSAGE#50:heartbeat:crit2", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> connect: %{fld1}", processor_chain([
	dup4,
	dup5,
	setc("event_description","No such file or directory"),
]));

var msg51 = msg("heartbeat:crit2", part60);

var select15 = linear_select([
	msg46,
	msg47,
	msg48,
	msg49,
	msg50,
	msg51,
]);

var part61 = match("MESSAGE#51:runner", "nwparser.payload", "%{agent}[%{process_id}]: \u003c\u003c%{fld20}.%{severity}> Job \"%{operation_id}\" execution %{fld6->} command %{fld7}: \"%{action}\". Output %{fld9}: %{result}", processor_chain([
	dup4,
	dup5,
]));

var msg52 = msg("runner", part61);

var part62 = match("MESSAGE#52:runner:01", "nwparser.payload", "%{agent}[%{process_id}]: \u003c\u003c%{fld20}.%{severity}> Processing command: %{action}", processor_chain([
	dup4,
	dup5,
]));

var msg53 = msg("runner:01", part62);

var part63 = match("MESSAGE#53:runner:02", "nwparser.payload", "%{agent}[%{process_id}]: \u003c\u003c%{fld20}.%{severity}> Job \"%{operation_id}\" execution %{fld6->} finished running.", processor_chain([
	dup4,
	dup5,
]));

var msg54 = msg("runner:02", part63);

var part64 = match("MESSAGE#54:runner:crit1", "nwparser.payload", "%{agent}[%{process_id}]: \u003c\u003c%{fld20}.%{severity}> Failed to exec %{filename}", processor_chain([
	dup4,
	dup5,
]));

var msg55 = msg("runner:crit1", part64);

var part65 = match("MESSAGE#55:runner:crit2", "nwparser.payload", "%{agent}[%{process_id}]: \u003c\u003c%{fld20}.%{severity}> File reading failed", processor_chain([
	dup4,
	dup5,
	setc("event_description","File reading failed"),
]));

var msg56 = msg("runner:crit2", part65);

var select16 = linear_select([
	msg52,
	msg53,
	msg54,
	msg55,
	msg56,
]);

var part66 = match("MESSAGE#56:ccd", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> Device %{hostname}: attempting connection using %{fld6->} on port: %{fld7}", processor_chain([
	dup4,
	dup5,
]));

var msg57 = msg("ccd", part66);

var part67 = match("MESSAGE#57:ccd:01", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> Device %{hostname}: %{event_description}, Reason %{result}", processor_chain([
	dup4,
	dup5,
]));

var msg58 = msg("ccd:01", part67);

var part68 = match("MESSAGE#58:ccd:03", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> Device %{hostname}: couldn't match the response \u003c\u003c%{event_description}>", processor_chain([
	dup4,
	dup5,
]));

var msg59 = msg("ccd:03", part68);

var part69 = match("MESSAGE#59:ccd:04", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> Device %{hostname}: Did not get echo for the command \u003c\u003c%{action}>for past %{fld10}", processor_chain([
	dup4,
	dup5,
]));

var msg60 = msg("ccd:04", part69);

var part70 = match("MESSAGE#60:ccd:02", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> Device %{hostname}: %{info}", processor_chain([
	dup4,
	dup5,
	setc("event_description","info on device connection"),
]));

var msg61 = msg("ccd:02", part70);

var part71 = match("MESSAGE#61:ccd:05", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> write to %{fld1->} pipe : %{info}", processor_chain([
	dup4,
	dup5,
	setc("event_description","write to ssh pipe"),
]));

var msg62 = msg("ccd:05", part71);

var part72 = match("MESSAGE#62:ccd:06", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> ccd_handle_read_failure(), %{info}", processor_chain([
	dup4,
	dup5,
	setc("event_description","ccd handle read failure"),
]));

var msg63 = msg("ccd:06", part72);

var part73 = match("MESSAGE#63:ccd:07", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> Device Communication Daemon online", processor_chain([
	dup4,
	dup5,
	setc("event_description","device communication daemon online"),
]));

var msg64 = msg("ccd:07", part73);

var part74 = match("MESSAGE#64:ccd:08", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> System memory is: %{fld1}", processor_chain([
	dup4,
	dup5,
	setc("event_description","system memory size"),
]));

var msg65 = msg("ccd:08", part74);

var select17 = linear_select([
	msg57,
	msg58,
	msg59,
	msg60,
	msg61,
	msg62,
	msg63,
	msg64,
	msg65,
]);

var part75 = match("MESSAGE#65:sshd", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> error: Bind to port %{fld10->} on %{fld5->} failed: %{result}", processor_chain([
	dup8,
	dup5,
]));

var msg66 = msg("sshd", part75);

var part76 = match("MESSAGE#66:sshd:01", "nwparser.payload", "%{agent}: bad username %{fld1}", processor_chain([
	dup4,
	dup5,
	setc("event_description","bad username"),
]));

var msg67 = msg("sshd:01", part76);

var part77 = match("MESSAGE#67:sshd:02", "nwparser.payload", "%{agent}[%{process_id}]: %{fld21}(%{fld1}:%{fld2}): authentication failure; %{info}", processor_chain([
	dup4,
	dup5,
	dup9,
]));

var msg68 = msg("sshd:02", part77);

var part78 = match("MESSAGE#68:sshd:03", "nwparser.payload", "%{agent}[%{process_id}]: %{fld21}(%{fld1}:%{fld2}): check pass; %{fld3}", processor_chain([
	dup4,
	dup5,
	setc("event_description","check pass, user unknown"),
]));

var msg69 = msg("sshd:03", part78);

var part79 = match("MESSAGE#69:sshd:04", "nwparser.payload", "%{agent}[%{process_id}]: PAM %{fld1->} more authentication failure; %{info}", processor_chain([
	dup4,
	dup5,
	dup9,
]));

var msg70 = msg("sshd:04", part79);

var msg71 = msg("sshd:pam", dup10);

var select18 = linear_select([
	msg66,
	msg67,
	msg68,
	msg69,
	msg70,
	msg71,
]);

var part80 = match("MESSAGE#71:dmd", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> inserted device id = %{hostname->} and serial number = %{fld6->} into DB", processor_chain([
	dup4,
	dup5,
]));

var msg72 = msg("dmd", part80);

var part81 = match("MESSAGE#72:dmd:01", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> Health state for metric\"%{hostname}\" \"%{change_old}\" changed to \"%{change_new}\", reason: \"%{result}\"", processor_chain([
	dup4,
	dup5,
]));

var msg73 = msg("dmd:01", part81);

var part82 = match("MESSAGE#73:dmd:11", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> Health state for group \"%{group_object}\" changed from \"%{change_old}\" to \"%{change_new}\"", processor_chain([
	dup4,
	dup5,
]));

var msg74 = msg("dmd:11", part82);

var part83 = match("MESSAGE#74:dmd:02", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> Filter on (%{fld5}) things. %{event_description}", processor_chain([
	dup4,
	dup5,
]));

var msg75 = msg("dmd:02", part83);

var part84 = match("MESSAGE#75:dmd:03", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> Device ID \"%{hostname}\" error: %{event_description}", processor_chain([
	dup8,
	dup5,
]));

var msg76 = msg("dmd:03", part84);

var select19 = linear_select([
	msg72,
	msg73,
	msg74,
	msg75,
	msg76,
]);

var part85 = match("MESSAGE#76:logrotate", "nwparser.payload", "%{agent}: ALERT exited abnormally with %{fld10}", processor_chain([
	dup4,
	dup5,
	setc("event_description","ALERT exited abnormally"),
]));

var msg77 = msg("logrotate", part85);

var part86 = match("MESSAGE#77:ntpd", "nwparser.payload", "%{agent}[%{process_id}]: kernel time sync enabled %{fld10}", processor_chain([
	dup4,
	dup5,
	setc("event_description","kernel time sync enabled"),
]));

var msg78 = msg("ntpd", part86);

var part87 = match("MESSAGE#78:ntpd:01", "nwparser.payload", "%{agent}[%{process_id}]: time reset %{fld10}", processor_chain([
	dup4,
	dup5,
	setc("event_description","time reset"),
]));

var msg79 = msg("ntpd:01", part87);

var part88 = match("MESSAGE#79:ntpd:02", "nwparser.payload", "%{agent}[%{process_id}]: ntpd %{fld10}-r %{fld11}", processor_chain([
	dup4,
	dup5,
]));

var msg80 = msg("ntpd:02", part88);

var part89 = match("MESSAGE#80:ntpd:03", "nwparser.payload", "%{agent}[%{process_id}]: ntpd exiting on signal %{fld10}", processor_chain([
	dup4,
	dup5,
	setc("event_description","ntpd exiting on signal"),
]));

var msg81 = msg("ntpd:03", part89);

var select20 = linear_select([
	msg78,
	msg79,
	msg80,
	msg81,
]);

var part90 = match("MESSAGE#81:pm", "nwparser.payload", "%{agent}[%{process_id}]: \u003c\u003c%{fld20}.%{severity}> ntpd will start in %{fld10}", processor_chain([
	dup4,
	dup5,
	setc("event_description","ntpd will start in few secs"),
]));

var msg82 = msg("pm", part90);

var part91 = match("MESSAGE#82:pm:01", "nwparser.payload", "%{agent}[%{process_id}]: \u003c\u003c%{fld20}.%{severity}> ntpd started", processor_chain([
	dup4,
	dup5,
	setc("event_description","ntpd started"),
]));

var msg83 = msg("pm:01", part91);

var part92 = match("MESSAGE#83:pm:02", "nwparser.payload", "%{agent}[%{process_id}]: \u003c\u003c%{fld20}.%{severity}> print_msg(), %{info}", processor_chain([
	dup4,
	dup5,
	setc("event_description","print message"),
]));

var msg84 = msg("pm:02", part92);

var part93 = match("MESSAGE#84:pm:03", "nwparser.payload", "%{agent}[%{process_id}]: \u003c\u003c%{fld20}.%{severity}> %{info->} started", processor_chain([
	dup4,
	dup5,
	setc("event_description","service started"),
]));

var msg85 = msg("pm:03", part93);

var part94 = match("MESSAGE#85:pm:04", "nwparser.payload", "%{agent}[%{process_id}]: \u003c\u003c%{fld20}.%{severity}> %{info->} will start in %{fld1}", processor_chain([
	dup4,
	dup5,
	setc("event_description","service will start"),
]));

var msg86 = msg("pm:04", part94);

var part95 = match("MESSAGE#86:pm:05", "nwparser.payload", "%{agent}[%{process_id}]: \u003c\u003c%{fld20}.%{severity}> check_license_validity(), %{fld1}", processor_chain([
	dup4,
	dup5,
	setc("event_description","check license validity"),
]));

var msg87 = msg("pm:05", part95);

var part96 = match("MESSAGE#87:pm:06", "nwparser.payload", "%{agent}[%{process_id}]: \u003c\u003c%{fld20}.%{severity}> Connected to config daemon", processor_chain([
	dup4,
	dup5,
	setc("event_description","connected to config daemon"),
]));

var msg88 = msg("pm:06", part96);

var select21 = linear_select([
	msg82,
	msg83,
	msg84,
	msg85,
	msg86,
	msg87,
	msg88,
]);

var part97 = match("MESSAGE#88:anacron", "nwparser.payload", "%{agent}[%{process_id}]: Updated timestamp for job %{info->} to %{fld1}", processor_chain([
	dup4,
	dup5,
	setc("event_description","updated timestamp"),
]));

var msg89 = msg("anacron", part97);

var part98 = match("MESSAGE#89:anacron:01", "nwparser.payload", "%{agent}[%{process_id}]: Anacron %{version->} started on %{fld1}", processor_chain([
	dup4,
	dup5,
	setc("event_description","anacron started"),
]));

var msg90 = msg("anacron:01", part98);

var part99 = match("MESSAGE#90:anacron:02", "nwparser.payload", "%{agent}[%{process_id}]: Normal exit %{fld1}", processor_chain([
	dup4,
	dup5,
	setc("event_description","normal exit"),
]));

var msg91 = msg("anacron:02", part99);

var select22 = linear_select([
	msg89,
	msg90,
	msg91,
]);

var part100 = match("MESSAGE#91:epmd", "nwparser.payload", "%{agent}: epmd: invalid packet size (%{fld1})", processor_chain([
	dup4,
	dup5,
	setc("event_description","invalid packet size"),
]));

var msg92 = msg("epmd", part100);

var part101 = match("MESSAGE#92:epmd:01", "nwparser.payload", "%{agent}: epmd: got %{info}", processor_chain([
	dup4,
	dup5,
]));

var msg93 = msg("epmd:01", part101);

var part102 = match("MESSAGE#93:epmd:02", "nwparser.payload", "%{agent}: epmd: epmd running %{info}", processor_chain([
	dup4,
	dup5,
]));

var msg94 = msg("epmd:02", part102);

var select23 = linear_select([
	msg92,
	msg93,
	msg94,
]);

var part103 = match("MESSAGE#94:xinetd", "nwparser.payload", "%{agent}[%{process_id}]: xinetd %{event_description}", processor_chain([
	dup4,
	dup5,
]));

var msg95 = msg("xinetd", part103);

var part104 = match("MESSAGE#95:xinetd:01", "nwparser.payload", "%{agent}[%{process_id}]: Started working: %{fld1->} available services", processor_chain([
	dup4,
	dup5,
]));

var msg96 = msg("xinetd:01", part104);

var select24 = linear_select([
	msg95,
	msg96,
]);

var part105 = match("MESSAGE#96:auditd", "nwparser.payload", "%{agent}[%{process_id}]: Audit daemon rotating log files", processor_chain([
	dup4,
	dup5,
	setc("event_description","Audit daemon rotating log files"),
]));

var msg97 = msg("auditd", part105);

var part106 = match("MESSAGE#97:restorecond", "nwparser.payload", "%{agent}: Reset file context %{filename}: %{fld1}", processor_chain([
	dup4,
	dup5,
	setc("event_description","Reset file"),
]));

var msg98 = msg("restorecond", part106);

var part107 = match("MESSAGE#98:authd", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> handle_authd unknown message =%{fld1}", processor_chain([
	dup4,
	dup5,
	setc("event_description","handle authd unknown message"),
]));

var msg99 = msg("authd", part107);

var part108 = match("MESSAGE#99:authd:01", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> authd_signal_handler(), %{fld1}", processor_chain([
	dup4,
	dup5,
	setc("event_description","authd signal handler"),
]));

var msg100 = msg("authd:01", part108);

var part109 = match("MESSAGE#100:authd:02", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> authd_close(): %{info}", processor_chain([
	dup4,
	dup5,
	setc("event_description","authd close"),
]));

var msg101 = msg("authd:02", part109);

var select25 = linear_select([
	msg99,
	msg100,
	msg101,
]);

var part110 = match("MESSAGE#101:rsyslogd/0", "nwparser.payload", "%{agent}: W%{p0}");

var part111 = match("MESSAGE#101:rsyslogd/1_0", "nwparser.p0", "ARNING%{p0}");

var part112 = match("MESSAGE#101:rsyslogd/1_1", "nwparser.p0", "arning%{p0}");

var select26 = linear_select([
	part111,
	part112,
]);

var part113 = match("MESSAGE#101:rsyslogd/2", "nwparser.p0", ": %{event_description}");

var all11 = all_match({
	processors: [
		part110,
		select26,
		part113,
	],
	on_success: processor_chain([
		dup4,
		dup5,
	]),
});

var msg102 = msg("rsyslogd", all11);

var part114 = match("MESSAGE#102:shutdown", "nwparser.payload", "%{agent}[%{process_id}]: shutting down %{info}", processor_chain([
	dup4,
	dup5,
	setc("event_description","shutting down"),
]));

var msg103 = msg("shutdown", part114);

var part115 = match("MESSAGE#103:cmd", "nwparser.payload", "%{agent}: \u003c\u003c%{fld20}.%{severity}> cmd starting %{fld1}", processor_chain([
	dup4,
	dup5,
	setc("event_description","cmd starting"),
]));

var msg104 = msg("cmd", part115);

var chain1 = processor_chain([
	select1,
	msgid_select({
		"anacron": select22,
		"auditd": msg97,
		"authd": select25,
		"ccd": select17,
		"cli": select12,
		"cmd": msg104,
		"configd": select14,
		"dmd": select19,
		"epmd": select23,
		"heartbeat": select15,
		"logrotate": msg77,
		"ntpd": select20,
		"pm": select21,
		"poller": msg45,
		"restorecond": msg98,
		"rsyslogd": msg102,
		"runner": select16,
		"schedulerd": select13,
		"shutdown": msg103,
		"sshd": select18,
		"xinetd": select24,
	}),
]);

var part116 = match("MESSAGE#0:cli/0", "nwparser.payload", "%{agent}[%{process_id}]: \u003c\u003c-%{fld20}.%{severity}> %{username}@%{p0}");

var part117 = match_copy("MESSAGE#0:cli/2", "nwparser.p0", "action");

var part118 = match("MESSAGE#10:cli:pam", "nwparser.payload", "%{agent}[%{process_id}]: %{fld21}(%{fld1}:%{fld2}): pam_putenv: %{fld3}", processor_chain([
	dup4,
	dup5,
	dup6,
]));
