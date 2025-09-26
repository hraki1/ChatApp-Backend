const validateUser = (userData) => {
  const errors = [];

  if (!userData.name || userData.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (userData.name && userData.name.length > 50) {
    errors.push('Name must be less than 50 characters');
  }

  if (!userData.image) {
    errors.push('Profile image is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateMessage = (messageData) => {
  const errors = [];

  if (!messageData.message || messageData.message.trim().length === 0) {
    errors.push('Message is required');
  }

  if (messageData.message && messageData.message.length > 1000) {
    errors.push('Message must be less than 1000 characters');
  }

  if (!messageData.senderId) {
    errors.push('Sender ID is required');
  }

  if (!messageData.receiverId) {
    errors.push('Receiver ID is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateUser,
  validateMessage
};
