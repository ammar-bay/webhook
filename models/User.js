module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
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
  User.associate = function (models) {
    User.belongsToMany(models.Conversation, {
      through: "Conversation_User",
      foreignKey: "user_id",
    });
    User.hasMany(models.Message, {
      foreignKey: "user_id",
      as: "messages",
      onUpdate: "SET NULL",
      onDelete: "SET NULL",
    });
  };
  return User;
};