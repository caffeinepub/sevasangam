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
      published : Bool;
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

  // Persisted stores (now must be mutable vars for migration to work)
  var categoryMap = Map.empty<Text, Category.Category>();
  var workerMap = Map.empty<Text, Worker.WorkerProfile>();
  var inquiryMap = Map.empty<Text, Inquiry.Inquiry>();
  var userProfiles = Map.empty<Principal, UserProfile>();

  // Hardcoded credentials for custom admin
  let adminUsername = "akash7711";
  let adminPassword = "Incorrect9978#*";

  func isAuthorizedAdmin(caller : Principal, username : ?Text, password : ?Text) : Bool {
    if (caller.isAnonymous()) {
      switch (username, password) {
        case (?u, ?p) {
          return u == adminUsername and p == adminPassword;
        };
        case (_) { return false };
      };
    };
    AccessControl.isAdmin(accessControlState, caller);
  };

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

  public query func getAllCategories() : async [Category.Category] {
    categoryMap.values().toArray().filter<Category.Category>(
      func(c : Category.Category) : Bool {
        c.status == #active;
      }
    );
  };

  public query func getCategory(categoryId : Text) : async ?Category.Category {
    let category = categoryMap.get(categoryId);
    switch (category) {
      case null { null };
      case (?c) {
        if (c.status == #active) {
          ?c;
        } else {
          null;
        };
      };
    };
  };

  public shared ({ caller }) func registerWorker(profile : Worker.WorkerProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register as workers");
    };

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
        published = false;
      };
      workerMap.add(profile.id, pendingProfile);
    } else {
      workerMap.add(profile.id, profile);
    };
  };

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
        if (worker.principal != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own profile");
        };

        if (not AccessControl.isAdmin(accessControlState, caller)) {
          let needsReapproval = worker.category_id != profile.category_id;
          let updatedProfile = {
            id = profile.id;
            principal = worker.principal;
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
            published = worker.published;
          };
          workerMap.add(workerId, updatedProfile);
        } else {
          workerMap.add(workerId, profile);
        };
      };
    };
  };

  public query ({ caller }) func getMyWorkerProfile() : async ?Worker.WorkerProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their profile");
    };

    for ((id, worker) in workerMap.entries()) {
      if (worker.principal == caller) {
        return ?worker;
      };
    };
    null;
  };

  public query ({ caller }) func getWorkerProfile(workerId : Text) : async ?Worker.WorkerProfile {
    let worker = workerMap.get(workerId);
    switch (worker) {
      case null { null };
      case (?w) {
        if (AccessControl.isAdmin(accessControlState, caller)) {
          return ?w;
        };
        if (w.principal == caller) {
          return ?w;
        };
        if ((w.status == #approved or w.status == #featured) and w.published) {
          return ?w;
        };
        null;
      };
    };
  };

  public shared ({ caller }) func getWorkerProfileAdmin(username : ?Text, password : ?Text, workerId : Text) : async ?Worker.WorkerProfile {
    if (not isAuthorizedAdmin(caller, username, password)) {
      Runtime.trap("Unauthorized: Only admins can access worker profiles with credentials");
    };
    workerMap.get(workerId);
  };

  public query ({ caller }) func getAllWorkers() : async [Worker.WorkerProfile] {
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    if (isAdmin) {
      workerMap.values().toArray();
    } else {
      workerMap.values().toArray().filter<Worker.WorkerProfile>(
        func(w : Worker.WorkerProfile) : Bool {
          (w.status == #approved or w.status == #featured) and w.published;
        }
      );
    };
  };

  public shared ({ caller }) func getAllWorkersAdmin(username : ?Text, password : ?Text) : async [Worker.WorkerProfile] {
    if (not isAuthorizedAdmin(caller, username, password)) {
      Runtime.trap("Unauthorized: Only admins can access all workers");
    };
    workerMap.values().toArray();
  };

  public query func getWorkersByCategory(categoryId : Text) : async [Worker.WorkerProfile] {
    workerMap.values().toArray().filter<Worker.WorkerProfile>(
      func(w : Worker.WorkerProfile) : Bool {
        w.category_id == categoryId and (w.status == #approved or w.status == #featured) and w.published;
      }
    );
  };

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
          published = w.published;
        };
        workerMap.add(workerId, approvedWorker);
      };
    };
  };

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
          published = w.published;
        };
        workerMap.add(workerId, rejectedWorker);
      };
    };
  };

  public shared ({ caller }) func removeWorker(username : ?Text, password : ?Text, workerId : Text) : async () {
    if (not isAuthorizedAdmin(caller, username, password)) {
      Runtime.trap("Unauthorized: Only admins can remove workers");
    };
    workerMap.remove(workerId);
  };

  public shared ({ caller }) func publishWorker(username : ?Text, password : ?Text, workerId : Text) : async () {
    if (not isAuthorizedAdmin(caller, username, password)) {
      Runtime.trap("Unauthorized: Only admins can publish workers");
    };

    let worker = workerMap.get(workerId);
    switch (worker) {
      case null {
        Runtime.trap("Worker not found");
      };
      case (?w) {
        let publishedWorker = {
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
          status = w.status;
          published = true;
        };
        workerMap.add(workerId, publishedWorker);
      };
    };
  };

  public shared ({ caller }) func unpublishWorker(username : ?Text, password : ?Text, workerId : Text) : async () {
    if (not isAuthorizedAdmin(caller, username, password)) {
      Runtime.trap("Unauthorized: Only admins can unpublish workers");
    };

    let worker = workerMap.get(workerId);
    switch (worker) {
      case null {
        Runtime.trap("Worker not found");
      };
      case (?w) {
        let unpublishedWorker = {
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
          status = w.status;
          published = false;
        };
        workerMap.add(workerId, unpublishedWorker);
      };
    };
  };

  public shared ({ caller }) func createInquiry(inquiry : Inquiry.Inquiry) : async () {
    inquiryMap.add(inquiry.id, inquiry);
  };

  public shared ({ caller }) func getAllInquiries(username : ?Text, password : ?Text) : async [Inquiry.Inquiry] {
    if (not isAuthorizedAdmin(caller, username, password)) {
      Runtime.trap("Unauthorized: Only admins can view all inquiries");
    };
    inquiryMap.values().toArray();
  };

  public shared ({ caller }) func updateInquiry(username : ?Text, password : ?Text, inquiryId : Text, inquiry : Inquiry.Inquiry) : async () {
    if (not isAuthorizedAdmin(caller, username, password)) {
      Runtime.trap("Unauthorized: Only admins can update inquiries");
    };
    inquiryMap.add(inquiryId, inquiry);
  };

  public shared ({ caller }) func deleteInquiry(username : ?Text, password : ?Text, inquiryId : Text) : async () {
    if (not isAuthorizedAdmin(caller, username, password)) {
      Runtime.trap("Unauthorized: Only admins can delete inquiries");
    };
    inquiryMap.remove(inquiryId);
  };

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
