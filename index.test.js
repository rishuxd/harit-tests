import axios from "axios";

const MOB_NUM = "7068514542";
const PWD = "Abc@1234";

const apiClient = axios.create({
  baseURL: "https://api.haritindia.in/api",
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return error.response ? error.response : Promise.reject(error);
  }
);

describe("Buyer Registration", () => {
  test("Registration fails if required fields are missing", async () => {
    // 'category' and 'otp' are not provided
    const response = await apiClient.post(`/buyer/register`, {
      mobNum: "9876543210",
      email: "test@example.com",
      pwd: "Abc@1234",
      repwd: "Abc@1234",
    });

    // Assuming validateFields throws error with message "All fields are required"
    expect(response.status).toBe(400);
    expect(response.data.message).toBe("All fields are required");
  });

  test("Registration fails if OTP is expired", async () => {
    // In this case, no OTP record exists for the provided mobile number
    const response = await apiClient.post(`/buyer/register`, {
      category: "buyer",
      mobNum: "9876543210",
      email: "test@example.com",
      pwd: "Abc@1234",
      repwd: "Abc@1234",
      otp: "0000",
    });

    expect(response.status).toBe(404);
    expect(response.data.message).toBe(
      "OTP expired! Please request a new OTP."
    );
  });

  test("Registration fails if passwords do not match", async () => {
    const response = await apiClient.post(`/buyer/register`, {
      category: "buyer",
      mobNum: MOB_NUM,
      email: "test@example.com",
      pwd: "Abc@1234",
      repwd: "Abc@1235",
      otp: "1234",
    });

    expect(response.status).toBe(400);
    expect(response.data.message).toBe("Fields do not match");
  });

  test.skip("Registration succeeds with valid input", async () => {
    // Simulate OTP generation: Ensure that a valid OTP record exists for this mobile number.
    // This may involve calling an endpoint (e.g., /buyer/registration-otp) or directly seeding the DB.
    await apiClient.post(`/buyer/registration-otp`, {
      mobNum: "9876543210",
    });

    // Assume that the generated/seeded OTP is "1234"
    const validOtp = "1234";

    const response = await apiClient.post(`/buyer/register`, {
      category: "buyer",
      mobNum: "9876543210",
      email: "test@example.com",
      pwd: "Abc@1234",
      repwd: "Abc@1234",
      otp: validOtp,
    });

    expect(response.status).toBe(200);
    expect(response.data.message).toBe("User registered successfully!");
    expect(response.headers["set-cookie"]).toBeDefined();
  });
});

describe.skip("Buyer Login", () => {
  test("Login fails if fields are missing", async () => {
    const response = await apiClient.post("/buyer/login", {
      password: "123456",
    });

    expect(response.status).toBe(400);
    expect(response.data.message).toBe("All fields are required");
  });

  test("Login fails if password format is incorrect", async () => {
    const response = await apiClient.post(`/buyer/login`, {
      mobNum: "9876543210",
      password: "wrongpassword",
    });

    expect(response.status).toBe(400);
    expect(response.data.message).toBe(
      "Password length should be between 6 to 12 characters"
    );
  });

  test("Login fails if mobile number is not registered", async () => {
    const response = await apiClient.post(`/buyer/login`, {
      mobNum: "9876543210",
      password: "Abc@123",
    });

    expect(response.status).toBe(404);
    expect(response.data.message).toBe("Mobile number not registered");
  });

  test("Login succeeds with correct mobile number and password", async () => {
    const response = await apiClient.post(`/buyer/login`, {
      mobNum: MOB_NUM,
      password: PWD,
    });

    expect(response.status).toBe(200);
    expect(response.data.data.entity).toBeDefined();
    expect(response.headers["set-cookie"]).toBeDefined();
  });
});

// describe("Feedback API", () => {
//   beforeAll(async () => {
//     await apiClient.post(`/buyer/login`, {
//       MOB_NUM,
//       PWD,
//     });
//   });

//   test("Fails if rating is out of range", async () => {
//     const response = await apiClient.post(`/feedback`, {
//       feedbacktext: "Great service!",
//       rating: 6,
//     });

//     expect(response.status).toBe(401);
//     expect(response.data.message).toBe("Rating should be between 1 and 5");
//   });

//   //   test("Fails if feedback cannot be saved", async () => {
//   //     jest.spyOn(feedback, "create").mockImplementation(() => null);

//   //     const response = await axios.post(
//   //       `${BACKEND_URL}/feedback`,
//   //       {
//   //         feedbacktext: "Great service!",
//   //         rating: 5,
//   //       },
//   //       {
//   //         headers: { Authorization: `Bearer ${token}` },
//   //       }
//   //     );

//   //     expect(response.status).toBe(500);
//   //     expect(response.data.message).toBe("Unable to save feedback");
//   //   });

//   //   test("Saves feedback successfully", async () => {
//   //     const response = await axios.post(
//   //       `${BACKEND_URL}/feedback`,
//   //       {
//   //         feedbacktext: "Excellent service!",
//   //         rating: 5,
//   //       },
//   //       {
//   //         headers: { Authorization: `Bearer ${token}` },
//   //       }
//   //     );

//   //     expect(response.status).toBe(201);
//   //     expect(response.data.message).toBe("Feedback saved successfully");
//   //   });
// });

// describe("Field Agent API", () => {
//   test("Fails if required fields are missing", async () => {
//     const response = await axios.post(
//       `${BACKEND_URL}/field-agents`,
//       {},
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );
//     expect(response.status).toBe(400);
//   });

//   test("Fails if field agent already exists", async () => {
//     await axios.post(
//       `${BACKEND_URL}/field-agents`,
//       {
//         Name: "John Doe",
//         MobNum: "9876543210",
//         Block: "A",
//         Village: "Village1",
//         Pincode: "123456",
//         ID: "ID123",
//       },
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     const response = await axios.post(
//       `${BACKEND_URL}/field-agents`,
//       {
//         Name: "John Doe",
//         MobNum: "9876543210",
//         Block: "A",
//         Village: "Village1",
//         Pincode: "123456",
//         ID: "ID123",
//       },
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     expect(response.status).toBe(400);
//     expect(response.data.message).toBe("Field Agent already exists");
//   });

//   test("Succeeds with valid input", async () => {
//     const response = await axios.post(
//       `${BACKEND_URL}/field-agents`,
//       {
//         Name: "Jane Doe",
//         MobNum: "9876543211",
//         Block: "B",
//         Village: "Village2",
//         Pincode: "654321",
//         ID: "ID124",
//       },
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     expect(response.status).toBe(200);
//     expect(response.data.message).toBe("Field Agent added successfully!");
//   });
// });

// describe("Order API", () => {
//   test("Fails if required fields are missing", async () => {
//     const response = await axios.post(
//       `${BACKEND_URL}/orders`,
//       {},
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );
//     expect(response.status).toBe(400);
//   });

//   test("Fails if seller does not exist", async () => {
//     const response = await axios.post(
//       `${BACKEND_URL}/orders`,
//       {
//         superCategory: "Packaged",
//         sellerId: "invalidSellerId",
//         category: "Fruits",
//         product: "Apple",
//         type: "Fresh",
//         quantityUnit: "kg",
//         quantityValue: 10,
//         priceType: "Rate",
//         priceValue: 100,
//         rating: 4,
//       },
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     expect(response.status).toBe(404);
//     expect(response.data.message).toBe("Seller not found");
//   });

//   test("Fails if product does not exist", async () => {
//     const response = await axios.post(
//       `${BACKEND_URL}/orders`,
//       {
//         superCategory: "Packaged",
//         sellerId: "validSellerId",
//         category: "InvalidCategory",
//         product: "InvalidProduct",
//         type: "Fresh",
//         quantityUnit: "kg",
//         quantityValue: 10,
//         priceType: "Rate",
//         priceValue: 100,
//         rating: 4,
//       },
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     expect(response.status).toBe(404);
//     expect(response.data.message).toBe("Product not found");
//   });

//   test("Fails if user tries to place an order to themselves", async () => {
//     const response = await axios.post(
//       `${BACKEND_URL}/orders`,
//       {
//         superCategory: "Packaged",
//         sellerId: "sameUserId",
//         category: "Fruits",
//         product: "Apple",
//         type: "Fresh",
//         quantityUnit: "kg",
//         quantityValue: 10,
//         priceType: "Rate",
//         priceValue: 100,
//         rating: 4,
//       },
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     expect(response.status).toBe(400);
//     expect(response.data.message).toBe("You Cannot Place a Order to Yourself");
//   });

//   test("Succeeds with valid input", async () => {
//     const response = await axios.post(
//       `${BACKEND_URL}/orders`,
//       {
//         superCategory: "Packaged",
//         sellerId: "validSellerId",
//         category: "Fruits",
//         product: "Apple",
//         type: "Fresh",
//         quantityUnit: "kg",
//         quantityValue: 10,
//         priceType: "Rate",
//         priceValue: 100,
//         rating: 4,
//       },
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     expect(response.status).toBe(200);
//     expect(response.data.message).toBe("Order Created");
//   });
// });

// describe("Seller API", () => {
//   test("Fails if required fields are missing", async () => {
//     const response = await axios.post(
//       `${BACKEND_URL}/sellers`,
//       {},
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );
//     expect(response.status).toBe(400);
//   });

//   test("Fails if seller already exists", async () => {
//     await axios.post(
//       `${BACKEND_URL}/sellers`,
//       {
//         name: "John Doe",
//         mobNum: "9876543210",
//         bankAccountNumber: "123456789012",
//         ifscCode: "SBIN0001234",
//         block: "BlockA",
//         village: "VillageA",
//         pincode: "123456",
//         sellerType: "Retailer",
//       },
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     const response = await axios.post(
//       `${BACKEND_URL}/sellers`,
//       {
//         name: "John Doe",
//         mobNum: "9876543210",
//         bankAccountNumber: "123456789012",
//         ifscCode: "SBIN0001234",
//         block: "BlockA",
//         village: "VillageA",
//         pincode: "123456",
//         sellerType: "Retailer",
//       },
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     expect(response.status).toBe(400);
//     expect(response.data.message).toBe("Seller already exists");
//   });

//   test("Fails if invalid pincode is provided", async () => {
//     const response = await axios.post(
//       `${BACKEND_URL}/sellers`,
//       {
//         name: "Jane Doe",
//         mobNum: "9876543211",
//         bankAccountNumber: "123456789013",
//         ifscCode: "SBIN0001235",
//         block: "BlockB",
//         village: "VillageB",
//         pincode: "000000", // Invalid pincode
//         sellerType: "Wholesaler",
//       },
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     expect(response.status).toBe(400);
//     expect(response.data.message).toBe("Invalid Pincode");
//   });

//   test("Fails if bank account validation fails", async () => {
//     jest.spyOn(fetch, "default").mockImplementation(() =>
//       Promise.resolve({
//         json: () => Promise.resolve({ success: false }),
//       })
//     );

//     const response = await axios.post(
//       `${BACKEND_URL}/sellers`,
//       {
//         name: "Jane Doe",
//         mobNum: "9876543211",
//         bankAccountNumber: "123456789013",
//         ifscCode: "SBIN0001235",
//         block: "BlockB",
//         village: "VillageB",
//         pincode: "654321",
//         sellerType: "Wholesaler",
//       },
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     expect(response.status).toBe(400);
//     expect(response.data.message).toBe(
//       "Error In Validating Account Information"
//     );
//   });

//   test("Succeeds with valid input", async () => {
//     jest.spyOn(fetch, "default").mockImplementation(() =>
//       Promise.resolve({
//         json: () =>
//           Promise.resolve({
//             success: true,
//             data: { account_name: "Jane Doe" },
//           }),
//       })
//     );

//     const response = await axios.post(
//       `${BACKEND_URL}/sellers`,
//       {
//         name: "Jane Doe",
//         mobNum: "9876543211",
//         bankAccountNumber: "123456789013",
//         ifscCode: "SBIN0001235",
//         block: "BlockB",
//         village: "VillageB",
//         pincode: "654321",
//         sellerType: "Wholesaler",
//       },
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     expect(response.status).toBe(200);
//     expect(response.data.message).toBe("Seller added successfully");
//   });
// });

// describe("Watchlist API", () => {
//   const token = "Bearer mockToken";

//   test("Fails if product ID is missing", async () => {
//     const res = await axios.post(
//       `${BACKEND_URL}/watchlist`,
//       {},
//       { headers: { Authorization: token } }
//     );
//     expect(res.status).toBe(400);
//   });

//   test("Fails if product not found", async () => {
//     jest.spyOn(sellerProducts, "findOne").mockResolvedValue(null);
//     const res = await axios.post(
//       `${BACKEND_URL}/watchlist`,
//       { productId: "123" },
//       { headers: { Authorization: token } }
//     );
//     expect(res.status).toBe(404);
//   });

//   test("Fails if product already in watchlist", async () => {
//     jest.spyOn(sellerProducts, "findOne").mockResolvedValue({});
//     jest
//       .spyOn(Watchlist, "findOne")
//       .mockResolvedValue({ products: [{ productId: "123" }] });
//     const res = await axios.post(
//       `${BACKEND_URL}/watchlist`,
//       { productId: "123" },
//       { headers: { Authorization: token } }
//     );
//     expect(res.status).toBe(400);
//   });

//   test("Succeeds if product added", async () => {
//     jest.spyOn(sellerProducts, "findOne").mockResolvedValue({});
//     jest.spyOn(Watchlist, "findOne").mockResolvedValue(null);
//     const res = await axios.post(
//       `${BACKEND_URL}/watchlist`,
//       { productId: "123" },
//       { headers: { Authorization: token } }
//     );
//     expect(res.status).toBe(200);
//   });
// });

// describe("Watchlist API", () => {
//   const token = "Bearer mockToken";

//   test("Fails if product ID is missing", async () => {
//     const res = await axios.post(
//       `${BACKEND_URL}/watchlist`,
//       {},
//       { headers: { Authorization: token } }
//     );
//     expect(res.status).toBe(400);
//   });

//   test("Fails if product not found", async () => {
//     jest.spyOn(sellerProducts, "findOne").mockResolvedValue(null);
//     const res = await axios.post(
//       `${BACKEND_URL}/watchlist`,
//       { productId: "123" },
//       { headers: { Authorization: token } }
//     );
//     expect(res.status).toBe(404);
//   });

//   test("Fails if product already in watchlist", async () => {
//     jest.spyOn(sellerProducts, "findOne").mockResolvedValue({});
//     jest
//       .spyOn(Watchlist, "findOne")
//       .mockResolvedValue({ products: [{ productId: "123" }] });
//     const res = await axios.post(
//       `${BACKEND_URL}/watchlist`,
//       { productId: "123" },
//       { headers: { Authorization: token } }
//     );
//     expect(res.status).toBe(400);
//   });

//   test("Succeeds if product added", async () => {
//     jest.spyOn(sellerProducts, "findOne").mockResolvedValue({});
//     jest.spyOn(Watchlist, "findOne").mockResolvedValue(null);
//     jest.spyOn(Watchlist.prototype, "save").mockResolvedValue();
//     const res = await axios.post(
//       `${BACKEND_URL}/watchlist`,
//       { productId: "123" },
//       { headers: { Authorization: token } }
//     );
//     expect(res.status).toBe(200);
//   });
// });

// describe("Bidding API", () => {
//   const token = "Bearer mockToken";

//   test("Fails if required fields are missing", async () => {
//     const res = await axios.post(
//       `${BACKEND_URL}/bids`,
//       {},
//       { headers: { Authorization: token } }
//     );
//     expect(res.status).toBe(400);
//   });

//   test("Fails if no image is provided", async () => {
//     const res = await axios.post(
//       `${BACKEND_URL}/bids`,
//       {
//         superCategory: "Fruits",
//         category: "Apples",
//         type: "Red",
//         variant: "Premium",
//         unit: "kg",
//         quantity: 100,
//         baseRate: 50,
//         minBidQuantity: 10,
//         harvestingDate: "2024-12-01",
//         bidClosingDate: "2024-12-15",
//         description: "Fresh apples",
//         productQuality: "A",
//         hsncode: "1234",
//         gstRate: 5,
//         shippingOptions: ["Pickup"],
//       },
//       { headers: { Authorization: token } }
//     );
//     expect(res.status).toBe(400);
//   });

//   test("Fails if image upload fails", async () => {
//     jest
//       .spyOn(global, "processImageUpload")
//       .mockResolvedValue({ error: "Image upload failed" });

//     const res = await axios.post(
//       `${BACKEND_URL}/bids`,
//       {
//         superCategory: "Fruits",
//         category: "Apples",
//         type: "Red",
//         variant: "Premium",
//         unit: "kg",
//         quantity: 100,
//         baseRate: 50,
//         minBidQuantity: 10,
//         harvestingDate: "2024-12-01",
//         bidClosingDate: "2024-12-15",
//         description: "Fresh apples",
//         productQuality: "A",
//         hsncode: "1234",
//         gstRate: 5,
//         shippingOptions: ["Pickup"],
//         ss1: "base64image",
//       },
//       { headers: { Authorization: token } }
//     );
//     expect(res.status).toBe(500);
//   });

//   test("Succeeds if bid is created successfully", async () => {
//     jest
//       .spyOn(global, "processImageUpload")
//       .mockResolvedValue({ data: { name: "image1" } });
//     jest.spyOn(Bidding, "create").mockResolvedValue({});

//     const res = await axios.post(
//       `${BACKEND_URL}/bids`,
//       {
//         superCategory: "Fruits",
//         category: "Apples",
//         type: "Red",
//         variant: "Premium",
//         unit: "kg",
//         quantity: 100,
//         baseRate: 50,
//         minBidQuantity: 10,
//         harvestingDate: "2024-12-01",
//         bidClosingDate: "2024-12-15",
//         description: "Fresh apples",
//         productQuality: "A",
//         hsncode: "1234",
//         gstRate: 5,
//         shippingOptions: ["Pickup"],
//         ss1: "base64image",
//       },
//       { headers: { Authorization: token } }
//     );

//     expect(res.status).toBe(200);
//   });
// });

// describe("Task Creation via WebSocket", () => {
//   let mockSocket, mockIo;

//   beforeEach(() => {
//     mockSocket = {
//       emit: jest.fn(),
//       id: "buyer123",
//     };
//     mockIo = {
//       to: jest.fn(() => ({ emit: jest.fn() })),
//     };
//   });

//   test("Fails if required fields are missing", async () => {
//     const values = {
//       taskType: "QualityAssessment",
//       agentId: "agent123",
//     }; // Missing required fields

//     await createTaskWSS(values, mockSocket, mockIo);

//     expect(mockSocket.emit).toHaveBeenCalledWith(
//       "addTaskRes",
//       expect.objectContaining({
//         statusCode: 400,
//         message: expect.any(String),
//       })
//     );
//   });

//   test("Fails if task creation fails", async () => {
//     jest.spyOn(TaskAssignement, "create").mockResolvedValueOnce(null);

//     const values = {
//       referencetype: "Procurement",
//       referencedata: "data123",
//       taskType: "HandoverSupplies",
//       state: "State",
//       district: "District",
//       agentId: "agent123",
//       dueDate: "2024-12-31",
//       DestinationAddress: "Address",
//       TaskDescription: "Deliver supplies",
//       isDelivery: true,
//     };

//     await createTaskWSS(values, mockSocket, mockIo);

//     expect(mockSocket.emit).toHaveBeenCalledWith(
//       "addTaskRes",
//       expect.objectContaining({
//         statusCode: 400,
//         message: "Unable to create task",
//       })
//     );
//   });

//   test("Succeeds with valid input for QualityAssessment task", async () => {
//     jest.spyOn(TaskAssignement, "create").mockResolvedValueOnce({
//       _id: "task123",
//       save: jest.fn().mockResolvedValueOnce({ _id: "task123" }),
//     });
//     jest
//       .spyOn(qualityAssessment, "create")
//       .mockResolvedValueOnce({ _id: "qa123" });
//     jest.spyOn(FieldAgents, "findById").mockResolvedValueOnce({
//       PushToken: ["token123"],
//     });
//     jest.spyOn(Entity, "findById").mockResolvedValueOnce({ Name: "BuyerName" });
//     jest.spyOn(sendNotification, "default").mockResolvedValueOnce();
//     jest
//       .spyOn(dashboardFunctionWSS, "default")
//       .mockResolvedValueOnce({ data: "dashboardData" });

//     const values = {
//       referencetype: "Procurement",
//       referencedata: "data123",
//       taskType: "QualityAssessment",
//       state: "State",
//       district: "District",
//       agentId: "agent123",
//       dueDate: "2024-12-31",
//       DestinationAddress: "Address",
//       TaskDescription: "Inspect quality",
//     };

//     await createTaskWSS(values, mockSocket, mockIo);

//     expect(mockSocket.emit).toHaveBeenCalledWith(
//       "addTaskRes",
//       expect.objectContaining({
//         statusCode: 201,
//         message: "Task created successfully",
//       })
//     );
//     expect(mockIo.to).toHaveBeenCalledWith("agent123");
//   });

//   test("Fails if notification cannot be sent", async () => {
//     jest.spyOn(TaskAssignement, "create").mockResolvedValueOnce({
//       _id: "task123",
//       save: jest.fn().mockResolvedValueOnce({ _id: "task123" }),
//     });
//     jest
//       .spyOn(qualityAssessment, "create")
//       .mockResolvedValueOnce({ _id: "qa123" });
//     jest.spyOn(FieldAgents, "findById").mockResolvedValueOnce({
//       PushToken: ["token123"],
//     });
//     jest.spyOn(Entity, "findById").mockResolvedValueOnce({ Name: "BuyerName" });
//     jest
//       .spyOn(sendNotification, "default")
//       .mockRejectedValueOnce(new Error("Notification error"));

//     const values = {
//       referencetype: "Procurement",
//       referencedata: "data123",
//       taskType: "QualityAssessment",
//       state: "State",
//       district: "District",
//       agentId: "agent123",
//       dueDate: "2024-12-31",
//       DestinationAddress: "Address",
//       TaskDescription: "Inspect quality",
//     };

//     await createTaskWSS(values, mockSocket, mockIo);

//     expect(mockSocket.emit).toHaveBeenCalledWith(
//       "addTaskRes",
//       expect.objectContaining({
//         statusCode: 500,
//         message: "Notification not sent",
//       })
//     );
//   });
// });
