module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define(
    "Conversation",
    {
      // Primary Key
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
      },
      last_message: {
        type: DataTypes.STRING,
      },
      last_message_type: {
        type: DataTypes.STRING,
      },
      last_message_time: {
        type: DataTypes.STRING,
      },
      last_message_by: {
        type: DataTypes.STRING,
      },
      platform: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      unread: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      // 0: active, 1: inactive (deleted) 2: blocked
      status: {
        type: DataTypes.STRING,
        defaultValue: "active",
      },
      // createdAt: {
      //   type: DataTypes.DATE,
      //   allowNull: true,
      //   defaultValue: DataTypes.NOW,
      // },
      // updatedAt: {
      //   type: DataTypes.DATE,
      //   allowNull: true,
      //   defaultValue: DataTypes.NOW,
      // },
    },
    {}
  );
  Conversation.associate = function (models) {
    // associations can be defined here
    Conversation.belongsToMany(models.User, {
      through: "Conversation_User",
      foreignKey: "conversation_id",
    });
    Conversation.hasMany(models.Message, {
      foreignKey: "conversation_id",
      as: "messages",
    });
  };
  return Conversation;
};
