module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define(
    "Message",
    {
      // Primary Key
      mid: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      // foreign key reference User
      user_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // foreign key reference Conversation
      conversation_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.STRING,
        allowNull: false,
      },
            status: {
        type: DataTypes.STRING,
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
  Message.associate = function (models) {
    Message.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
      onUpdate: "SET NULL",
      onDelete: "SET NULL",
    });
    Message.belongsTo(models.Conversation, {
      foreignKey: "conversation_id",
      as: "conversation",
    });
  };
  return Message;
};
