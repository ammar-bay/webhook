module.exports = (sequelize, DataTypes) => {
  const Conversation_User = sequelize.define("Conversation_User", {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    conversation_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
  });

  return Conversation_User;
};
