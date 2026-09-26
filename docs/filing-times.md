# State filing times template

`src/lib/filing-times.json` contains a separate record for every supported state/entity pair. Do not copy one state's timeline to another.

Each standard/expedited option has availability (`pending`, `available`, or `unavailable`), minimum and maximum business days, and an additional fee in USD. `null` means unknown, never zero. Record the official source URL and verification date before filling verified values. Standard additional fees are zero because the current checkout already includes standard filing fees; this does not mean state filing is free.

The checkout currently displays timing and dates as unconfirmed for all states. Standard is the only enabled choice. Expedited is intentionally disabled and does not change totals or send a paid option to the server. Populating the catalog alone must not enable expedited purchasing: first integrate verified fees with server-side quotes, order persistence, and payment validation. Estimated dates also require state holidays, cutoff times and a confirmed submission date, not merely adding days to today's date.

For a state that does not offer expedited filing, use `availability: "unavailable"`; its card will identify it as unavailable. Leave unknown options as `pending`.
