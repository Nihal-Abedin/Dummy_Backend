class ApiResponse {

  constructor(status = 0, message = "", data = {}) {
    this.date = new Date().toUTCString();
    this.status = status;
    this.message = message;
    this.data = data;
  }
}

module.exports = ApiResponse;
