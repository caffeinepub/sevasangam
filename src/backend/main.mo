import Text "mo:core/Text";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import BlobStorage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import UserApproval "user-approval/approval";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();

  // Category module
  module Category {
    public type Status = {
      #active;
      #suspended;
      #pending_approval;
      #rejected;
    };

    public type Category = {
      id : Text;
      name : Text;
      description : ?Text;
      status : Status;
    };

    public func toText(category : Category) : Text {
      category.id;
    };
  };

  // Worker module
  module Worker {
    public type Status = {
      #pending;
      #approved;
      #rejected;
      #featured;
    };

    public type Location = {
      country : ?Text;
      city : ?Text;
      district : ?Text;
      address : ?Text;
      latitude : ?Float;
      longitude : ?Float;
    };

    public type Schedule = {
      available_days : [Text];
      open_time : ?Text;
      close_time : ?Text;
      timezone : ?Text;
    };

    public type Pricing = {
      rate_per_hour : ?Nat;
      rate_per_day : ?Nat;
      currency : ?Text;
      special_offers : [Text];
    };

    public type Integrations = {
      whatsapp_number : ?Text;
      facebook_username : ?Text;
      instagram_handle : ?Text;
      website_url : ?Text;
    };

    public type WorkerProfile = {
      id : Text;
      principal : Principal;
      full_name : Text;
      phone_number : Text;
      photo : ?BlobStorage.ExternalBlob;
      category_id : Text;
      location : Location;
      years_experience : Nat;
      pricing : Pricing;
      availability : Schedule;
      integrations : Integrations;
      status : Status;
    };

    public func toText(worker : WorkerProfile) : Text {
      worker.id;
    };
  };

  // Inquiry module
  module Inquiry {
    public type InquiryStatus = {
      #new;
      #pending;
      #completed;
    };

    public type InquiryType = {
      #booking;
      #question;
      #feedback;
    };

    public type Inquiry = {
      id : Text;
      worker_id : Text;
      customer_name : ?Text;
      customer_contact : ?Text;
      inquiry_type : InquiryType;
      inquiry_text : Text;
      created_at : Int;
      status : InquiryStatus;
      response_text : ?Text;
      response_given : Bool;
    };
  };

  // User Profile type
  public type UserProfile = {
    name : Text;
    role : Text;
  };

  // State
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let approvalState = UserApproval.initState(accessControlState);

  // Persisted stores
  var categoryMap = Map.empty<Text, Category.Category>();
  var workerMap = Map.empty<Text, Worker.WorkerProfile>();
  var inquiryMap = Map.empty<Text, Inquiry.Inquiry>();
  var userProfiles = Map.empty<Principal, UserProfile>();

  // Hardcoded credentials for custom admin
  let adminUsername = "akash7711";
  let adminPassword = "Incorrect9978#*";

  // Helper function to check admin authorization
  // Return true when:
  // 1. Caller is anonymous AND credentials match the hardcoded admin credentials
  // 2. Otherwise: Use regular principal authentication fallback
  func isAuthorizedAdmin(caller : Principal, username : ?Text, password : ?Text) : Bool {
    // Check for hardcoded admin credentials when caller is anonymous
    if (caller.isAnonymous()) {
      switch (username, password) {
        case (?u, ?p) {
          return u == adminUsername and p == adminPassword;
        };
        case (_) { return false };
      };
    };
    // Regular principal-based authentication fallback
    AccessControl.isAdmin(accessControlState, caller);
  };

  // User approval functions (required by system)
  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };

  // User Profile Management (required by instructions)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Category management - Admin only
  public shared ({ caller }) func createCategory(username : ?Text, password : ?Text, category : Category.Category) : async () {
    if (not isAuthorizedAdmin(caller, username, password)) {
      Runtime.trap("Unauthorized: Only admins can create categories");
    };
    categoryMap.add(category.id, category);
  };

  public shared ({ caller }) func updateCategory(username : ?Text, password : ?Text, categoryId : Text, category : Category.Category) : async () {
    if (not isAuthorizedAdmin(caller, username, password)) {
      Runtime.trap("Unauthorized: Only admins can update categories");
    };
    categoryMap.add(categoryId, category);
  };

  public shared ({ caller }) func deleteCategory(username : ?Text, password : ?Text, categoryId : Text) : async () {
    if (not isAuthorizedAdmin(caller, username, password)) {
      Runtime.trap("Unauthorized: Only admins can delete categories");
    };
    categoryMap.remove(categoryId);
  };

  // Public - no authentication required
  public query func getAllCategories() : async [Category.Category] {
    categoryMap.values().toArray();
  };

  public query func getCategory(categoryId : Text) : async ?Category.Category {
    categoryMap.get(categoryId);
  };

  // Worker registration - authenticated users only
  public shared ({ caller }) func registerWorker(profile : Worker.WorkerProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register as workers");
    };

    // Non-admins can only register themselves with pending status
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      if (profile.principal != caller) {
        Runtime.trap("Unauthorized: Can only register your own profile");
      };
      let pendingProfile = {
        id = profile.id;
        principal = caller;
        full_name = profile.full_name;
        phone_number = profile.phone_number;
        photo = profile.photo;
        category_id = profile.category_id;
        location = profile.location;
        years_experience = profile.years_experience;
        pricing = profile.pricing;
        availability = profile.availability;
        integrations = profile.integrations;
        status = #pending;
      };
      workerMap.add(profile.id, pendingProfile);
    } else {
      // Admins can register with any status
      workerMap.add(profile.id, profile);
    };
  };

  // Worker profile update - owner or admin only
  public shared ({ caller }) func updateWorkerProfile(workerId : Text, profile : Worker.WorkerProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update worker profiles");
    };

    let existingWorker = workerMap.get(workerId);
    switch (existingWorker) {
      case null {
        Runtime.trap("Worker profile not found");
      };
      case (?worker) {
        // Check ownership or admin
        if (worker.principal != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own profile");
        };

        // For non-admins, major changes trigger re-approval
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          let needsReapproval = worker.category_id != profile.category_id;
          let updatedProfile = {
            id = profile.id;
            principal = worker.principal; // Keep original principal
            full_name = profile.full_name;
            phone_number = profile.phone_number;
            photo = profile.photo;
            category_id = profile.category_id;
            location = profile.location;
            years_experience = profile.years_experience;
            pricing = profile.pricing;
            availability = profile.availability;
            integrations = profile.integrations;
            status = if (needsReapproval) { #pending } else { worker.status };
          };
          workerMap.add(workerId, updatedProfile);
        } else {
          // Admins can update everything including status
          workerMap.add(workerId, profile);
        };
      };
    };
  };

  // Get own worker profile - authenticated worker only
  public query ({ caller }) func getMyWorkerProfile() : async ?Worker.WorkerProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their profile");
    };

    // Find worker profile by principal
    for ((id, worker) in workerMap.entries()) {
      if (worker.principal == caller) {
        return ?worker;
      };
    };
    null;
  };

  // Get worker profile by ID - public but only approved workers visible to non-admins
  public query ({ caller }) func getWorkerProfile(workerId : Text) : async ?Worker.WorkerProfile {
    let worker = workerMap.get(workerId);
    switch (worker) {
      case null { null };
      case (?w) {
        // Admins (principal-based only for query) can see all profiles
        if (AccessControl.isAdmin(accessControlState, caller)) {
          return ?w;
        };
        // Owner can see their own profile regardless of status
        if (w.principal == caller) {
          return ?w;
        };
        // Public can only see approved workers
        if (w.status == #approved or w.status == #featured) {
          return ?w;
        };
        null;
      };
    };
  };

  // Get worker profile by ID with admin credentials - supports custom admin auth
  public shared ({ caller }) func getWorkerProfileAdmin(username : ?Text, password : ?Text, workerId : Text) : async ?Worker.WorkerProfile {
    if (not isAuthorizedAdmin(caller, username, password)) {
      Runtime.trap("Unauthorized: Only admins can access worker profiles with credentials");
    };
    workerMap.get(workerId);
  };

  // Get all workers - public but filtered by status for non-admins
  // Note: This query function only supports principal-based admin auth
  // For custom credential admin auth, use getAllWorkersAdmin instead
  public query ({ caller }) func getAllWorkers() : async [Worker.WorkerProfile] {
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    if (isAdmin) {
      // Admins see all workers
      workerMap.values().toArray();
    } else {
      // Public sees only approved workers
      workerMap.values().toArray().filter<Worker.WorkerProfile>(
        func(w : Worker.WorkerProfile) : Bool {
          w.status == #approved or w.status == #featured;
        }
      );
    };
  };

  // Admin-authorized fetch of all workers (supports custom credentials for admin dashboard)
  public shared ({ caller }) func getAllWorkersAdmin(username : ?Text, password : ?Text) : async [Worker.WorkerProfile] {
    if (not isAuthorizedAdmin(caller, username, password)) {
      Runtime.trap("Unauthorized: Only admins can access all workers");
    };
    workerMap.values().toArray();
  };

  // Get workers by category - public but only approved
  public query func getWorkersByCategory(categoryId : Text) : async [Worker.WorkerProfile] {
    workerMap.values().toArray().filter<Worker.WorkerProfile>(
      func(w : Worker.WorkerProfile) : Bool {
        w.category_id == categoryId and (w.status == #approved or w.status == #featured);
      }
    );
  };

  // Admin: Approve worker
  public shared ({ caller }) func approveWorker(username : ?Text, password : ?Text, workerId : Text) : async () {
    if (not isAuthorizedAdmin(caller, username, password)) {
      Runtime.trap("Unauthorized: Only admins can approve workers");
    };

    let worker = workerMap.get(workerId);
    switch (worker) {
      case null {
        Runtime.trap("Worker not found");
      };
      case (?w) {
        let approvedWorker = {
          id = w.id;
          principal = w.principal;
          full_name = w.full_name;
          phone_number = w.phone_number;
          photo = w.photo;
          category_id = w.category_id;
          location = w.location;
          years_experience = w.years_experience;
          pricing = w.pricing;
          availability = w.availability;
          integrations = w.integrations;
          status = #approved;
        };
        workerMap.add(workerId, approvedWorker);
      };
    };
  };

  // Admin: Reject worker
  public shared ({ caller }) func rejectWorker(username : ?Text, password : ?Text, workerId : Text) : async () {
    if (not isAuthorizedAdmin(caller, username, password)) {
      Runtime.trap("Unauthorized: Only admins can reject workers");
    };

    let worker = workerMap.get(workerId);
    switch (worker) {
      case null {
        Runtime.trap("Worker not found");
      };
      case (?w) {
        let rejectedWorker = {
          id = w.id;
          principal = w.principal;
          full_name = w.full_name;
          phone_number = w.phone_number;
          photo = w.photo;
          category_id = w.category_id;
          location = w.location;
          years_experience = w.years_experience;
          pricing = w.pricing;
          availability = w.availability;
          integrations = w.integrations;
          status = #rejected;
        };
        workerMap.add(workerId, rejectedWorker);
      };
    };
  };

  // Admin: Remove worker
  public shared ({ caller }) func removeWorker(username : ?Text, password : ?Text, workerId : Text) : async () {
    if (not isAuthorizedAdmin(caller, username, password)) {
      Runtime.trap("Unauthorized: Only admins can remove workers");
    };
    workerMap.remove(workerId);
  };

  // Inquiry management - public can create, admin can manage
  public shared ({ caller }) func createInquiry(inquiry : Inquiry.Inquiry) : async () {
    // Anyone including guests can create inquiries
    inquiryMap.add(inquiry.id, inquiry);
  };

  // Admin: Get all inquiries (update function - not query to protect credentials)
  public shared ({ caller }) func getAllInquiries(username : ?Text, password : ?Text) : async [Inquiry.Inquiry] {
    if (not isAuthorizedAdmin(caller, username, password)) {
      Runtime.trap("Unauthorized: Only admins can view all inquiries");
    };
    inquiryMap.values().toArray();
  };

  // Admin: Update inquiry
  public shared ({ caller }) func updateInquiry(username : ?Text, password : ?Text, inquiryId : Text, inquiry : Inquiry.Inquiry) : async () {
    if (not isAuthorizedAdmin(caller, username, password)) {
      Runtime.trap("Unauthorized: Only admins can update inquiries");
    };
    inquiryMap.add(inquiryId, inquiry);
  };

  // Admin: Delete inquiry
  public shared ({ caller }) func deleteInquiry(username : ?Text, password : ?Text, inquiryId : Text) : async () {
    if (not isAuthorizedAdmin(caller, username, password)) {
      Runtime.trap("Unauthorized: Only admins can delete inquiries");
    };
    inquiryMap.remove(inquiryId);
  };

  // Get inquiries for a specific worker - worker can see their own, admin can see all
  public query ({ caller }) func getWorkerInquiries(workerId : Text) : async [Inquiry.Inquiry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view inquiries");
    };

    let worker = workerMap.get(workerId);
    switch (worker) {
      case null {
        Runtime.trap("Worker not found");
      };
      case (?w) {
        // Check if caller is the worker or admin
        if (w.principal != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own inquiries");
        };

        inquiryMap.values().toArray().filter<Inquiry.Inquiry>(
          func(inq : Inquiry.Inquiry) : Bool {
            inq.worker_id == workerId;
          }
        );
      };
    };
  };

  // Admin: Get inquiries for a specific worker with admin credentials
  public shared ({ caller }) func getWorkerInquiriesAdmin(username : ?Text, password : ?Text, workerId : Text) : async [Inquiry.Inquiry] {
    if (not isAuthorizedAdmin(caller, username, password)) {
      Runtime.trap("Unauthorized: Only admins can view worker inquiries with credentials");
    };

    inquiryMap.values().toArray().filter<Inquiry.Inquiry>(
      func(inq : Inquiry.Inquiry) : Bool {
        inq.worker_id == workerId;
      }
    );
  };
};
