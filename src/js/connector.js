const reactions = [
	{ name: 'like', icon: '👍', title: 'Like' },
	{ name: 'love', icon: '❤️', title: 'Love' },
	{ name: 'haha', icon: '😂️', title: 'Ha-ha' },
	{ name: 'wow', icon: '😮', title: 'Wow' },
	{ name: 'sad', icon: '😢', title: 'Sad' },
	{ name: 'angry', icon: '😡', title: 'Angry' },
];

const cardDetailsBadgeClickHandler = (t, target) => {
	const context = t.getContext();
	return t.get('card', 'shared', target, [])
		.then(voters => {
			if (voters.includes(context.member)) {
				return t.set('card', 'shared', target, voters.filter(voter => voter !== context.member))
			}
			return t.set('card', 'shared', target, [...voters, context.member])
		});
};

const generateCardBadges = (t, reactions) => {
	return Promise.all([...reactions.map(reaction => t.get('card', 'shared', reaction.name, []))])
		.then(sharedData => {
			const badges = [];
			sharedData.forEach((voters, index) => {
				if (voters.length > 0) {
					badges.push({
						dynamic: (t) => {
							const context = t.getContext();
							return {
								text: `${reactions[index].icon} ${voters.length}`,
								...(voters.includes(context.member) ? { color: 'light-gray' } : {}),
								refresh: 1,
							}
						}
					})
				}
			});
			return badges;
		});
};

const generateCardDetailsBadges = (t, reactions) => {
	return reactions.map(reaction => ({
		dynamic: () => {
			return t.get('card', 'shared', reaction.name, [])
				.then(voters => {
					const context = t.getContext();
					return {
						title: `${reaction.title} ${reaction.icon}`,
						text: `${voters.length}`,
						...(voters.includes(context.member) ? { color: 'blue' } : {}),
						callback: () => cardDetailsBadgeClickHandler(t, reaction.name),
						refresh: 1,
					}
				})
		}
	}));
};

window.TrelloPowerUp.initialize({
	'card-badges': function(t, opts) {
		return generateCardBadges(t, reactions);
	},
	'card-detail-badges': function (t, opts) {
		return generateCardDetailsBadges(t, reactions)
	},
});
