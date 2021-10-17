import {
    Switch,
    Route,
    useRouteMatch,
    useHistory,
    useParams,
} from "react-router-dom";
import {
    GetMeetings,
    GetMeetingsWithTag,
    GetOneMeeting,
    CreateMeeting,
    EditMeeting,
    DeleteMeeting,
    GetBinList,
} from "../api";
import SideMenu from "../common/sideMenu";
import NavigationBar from "../common/nav";
import Table from "../common/table";
import meetings from "../json/MeetingList.json";
import { useForm } from "react-hook-form";
import { MdAdd } from "react-icons/md";
import { MultipleSelectChip } from "../common/tag";
import { useState, useEffect, useMemo} from "react";

const MeetingAll = () => {
    const { data, loading, error } = GetMeetings();

    if (loading) {
        return <p>loading</p>;
    }

    if (error) {
        return <p>error</p>;
    }

    return (
        <Table tab="meeting" data={data} option="delete"/>
    );
};

const MeetingWithTag = () => {
    let { tagName } = useParams();
    const { data, loading, error } = GetMeetingsWithTag(tagName);

    if (loading) {
        return <p>loading</p>;
    }

    if (error) {
        return <p>error</p>;
    }

    return <Table tab="meeting" data={data} option="delete"/>;
};

const MeetingBin = () => {
    const { data, loading, error } = GetBinList("M");

    if (loading) {
        return <p>loading</p>;
    }

    if (error) {
        return <p>error</p>;
    }

    return (
        <div>
            {data.length ? <p>meetings in bin</p> : <p>no meetings found.</p>}
        </div>
    );
};

const MeetingDetail = () => {
    let history = useHistory();
    let { id } = useParams();
    const { data, loading, error } = GetOneMeeting(id);
    const [isDisabled, setIsDisable] = useState(true);
    const {
        register,
        reset,
        handleSubmit,
        control,
        formState: { isDirty, isSubmitting, dirtyFields },
    } = useForm({
        defaultValues: [],
    });

    const CustomReset = (data) => {

        // get copy of data
        let defaultValue = JSON.parse(JSON.stringify(data));

        // re-format data
        defaultValue.Attachment = undefined;
        if (defaultValue.Tags) {
            defaultValue.Tags.map(opt => {
                opt.value = opt.TagId;
                opt.label = opt.TagName;
            })
        }
        if (defaultValue.StartTime) {
            defaultValue.Date = defaultValue.StartTime.slice(0, 10);
            defaultValue.StartTime = defaultValue.StartTime.slice(11, 16);
        }
        if (defaultValue.EndTime) {
            defaultValue.EndTime = defaultValue.EndTime.slice(11, 16);
        }

        // reset defaultValue
        reset(defaultValue);
    }

    const onSubmitHandler = (data) => {

        // check if there is any change
        if (isDirty) {

            // re-format data
            if (data.Tags) {
                data.TagIds = data.Tags.map(opt => opt.TagId);
            }
            if (data.Date) {
                if (data.StartTime) {
                    data.StartTime = new Date(
                        data.Date + "T" + data.StartTime + ":00Z"
                    ).toISOString();
                } else {
                    data.StartTime = new Date(data.Date).toISOString();
                }
    
                if (data.EndTime) {
                    data.EndTime = new Date(
                        data.Date + "T" + data.EndTime + ":00Z"
                    ).toISOString();
                } else {
                    data.EndTime = new Date(data.Date).toISOString();
                }
            }

            // send data to server
            data.Attachment = ""; // need to be update later
            data.InviteeIds = ["6132267b43c1ad80f1bd58a7"];
            EditMeeting(data, id).then((res) => console.log(res));

            // redirect to list page
            // history.push("/meeting");
            console.log(data); // test only
        }

    };

    const onCancelHandler = () => {

        // disable input
        setIsDisable(true);

        // reset value to defaultValue
        CustomReset(data);
    }

    const onDeleteHandler = () => {
        
        // send request to server
        DeleteMeeting(id).then((res) => {
            console.log(res);
        });

        // redirect to list page
        history.push("/meeting");

    }

    useEffect(() => {
        CustomReset(data);
    }, [data]);

    if (loading) {
        return <p>loading</p>;
    }

    if (error) {
        return <p>error</p>;
    }

    return (
        <div className="meeting">
            <form
                className="meeting-form"
                onSubmit={handleSubmit(onSubmitHandler)}
            >
                <button
                    className="detail-edit"
                    type="button"
                    hidden={isDisabled}
                    onClick={onCancelHandler}
                >
                    cancel
                </button>
                <button
                    className="detail-edit"
                    type="submit"
                    hidden={isDisabled}
                >
                    save
                </button>

                <button
                    className="detail-edit"
                    type="button"
                    hidden={!isDisabled}
                    onClick={() => setIsDisable(false)}
                >
                    edit
                </button>
                <button
                    className="detail-edit"
                    type="button"
                    hidden={!isDisabled}
                    onClick={onDeleteHandler}
                >
                    delete
                </button>

                <div class="meetingForm-keyInfo">
                    <div class="meetingForm-name">
                        <input
                            type="text"
                            placeholder="TITLE"
                            {...register("Title")}
                            required
                            disabled={isDisabled}
                        />
                    </div>
                    <MultipleSelectChip control={control} tagOf="M" isDisabled={isDisabled}/>
                    <div class="meetingForm-record">
                        <label>Location: </label>
                        <input
                            type="text"
                            {...register("Location")}
                            disabled={isDisabled}
                        />
                    </div>
                </div>

                <div class="meetingForm-Info">
                    <div class="meetingForm-record">
                        <label>Date: </label>
                        <input
                            type="date"
                            {...register("Date")}
                            disabled={isDisabled}
                        />
                    </div>

                    <div class="meetingForm-record">
                        <label>Start Time: </label>
                        <input
                            type="time"
                            {...register("StartTime")}
                            disabled={isDisabled}
                        />
                    </div>

                    <div class="meetingForm-record">
                        <label>End Time: </label>
                        <input
                            type="time"
                            {...register("EndTime")}
                            disabled={isDisabled}
                        />
                    </div>

                    <div class="meetingForm-record">
                        <label>URL: </label>
                        <input
                            type="url"
                            {...register("URL")}
                            disabled={isDisabled}
                        />
                    </div>
                </div>

                {/* <div class="meetingForm-attachment">
                    <label>Attachment: </label>
                    <input
                        type="file"
                        {...register("Attachment")}
                        disabled={isDisabled}
                    />
                </div> */}

                <div class="meetingForm-notes">
                    <label>Notes: </label>
                    <input
                        type="text"
                        {...register("Notes")}
                        disabled={isDisabled}
                    />
                </div>

                <div class="meetingForm-keyWords">
                    <label>Key words:</label>
                    <input
                        type="text"
                        {...register("NotesKeyWords")}
                        disabled={isDisabled}
                    />
                </div>
            </form>
        </div>
    );
};

const MeetingCreate = () => {
    let history = useHistory();
    const {
        register,
        control,
        handleSubmit,
        formState: { dirtyFields },
    } = useForm();

    // handle user input data
    const onSubmitHandler = (data) => {
        // re-group data
        if (data.Tags) {
            data.TagIds = data.Tags.map(opt => opt.TagId);
        }
        if (dirtyFields.Date) {
            if (dirtyFields.StartTime) {
                data.StartTime = new Date(
                    data.Date + "T" + data.StartTime + ":00Z"
                ).toISOString();
            } else {
                data.StartTime = new Date(data.Date).toISOString();
            }

            if (dirtyFields.EndTime) {
                data.EndTime = new Date(
                    data.Date + "T" + data.EndTime + ":00Z"
                ).toISOString();
            } else {
                data.EndTime = new Date(data.Date).toISOString();
            }
        }

        // send data to server
        data.Attachment = ""; // need to be update later
        data.InviteeIds = [];
        console.log(data);
        CreateMeeting(data).then((res) => console.log(res));

        // redirect to list page
        // history.push("/meeting");
    };

    return (
        <div className="meeting">
            <form
                className="meeting-form"
                onSubmit={handleSubmit(onSubmitHandler)}
            >
                <button className="detail-edit" type="submit">
                    create
                </button>

                <div class="meetingForm-keyInfo">
                    <div class="meetingForm-name">
                        <input
                            type="text"
                            placeholder="TITLE"
                            {...register("Title")}
                            required
                        />
                    </div>
                    <MultipleSelectChip control={control} tagOf="M"/>
                    <div class="meetingForm-record">
                        <label>Location: </label>
                        <input type="text" {...register("Location")} />
                    </div>
                </div>

                <div class="meetingForm-Info">
                    <div class="meetingForm-record">
                        <label>Date: </label>
                        <input type="date" {...register("Date")} />
                    </div>

                    <div class="meetingForm-record">
                        <label>Start Time: </label>
                        <input type="time" {...register("StartTime")} />
                    </div>

                    <div class="meetingForm-record">
                        <label>End Time: </label>
                        <input type="time" {...register("EndTime")} />
                    </div>

                    <div class="meetingForm-record">
                        <label>URL: </label>
                        <input type="url" {...register("URL")} />
                    </div>
                </div>

                <div class="meetingForm-attachment">
                    <label>Attachment: </label>
                    <input type="file" {...register("Attachment")} />
                </div>

                <div class="meetingForm-notes">
                    <label>Notes: </label>
                    <input type="text" {...register("Notes")} />
                </div>

                <div class="meetingForm-keyWords">
                    <label>Key words:</label>
                    <input type="text" {...register("NotesKeyWords")} />
                </div>
            </form>
        </div>
    );
};

// const Detail = () => {
//     let history = useHistory();
//     let { meetingID } = useParams();
//     const { meeting, loading, error } = GetOneMeeting(meetingID);

//     const {
//         register,
//         reset,
//         handleSubmit,
//         formState: { isDirty, isSubmitting },
//     } = useForm({
//         defaultValues: useMemo(() => meeting, [meeting]),
//     });
//     const [inputDisable, setInputDisable] = useState(true);


//     const onSubmitHandler = (data) => {
//         // check if there is any change
//         if (isDirty) {
//             // update tags
//             console.log(data);

//             // send data to server
//             // EditMeeting(data, meetingID).then((data) => {
//             //     if (data === undefined) {
//             //         alert("error");
//             //     } else {
//             //         alert(data.msg);
//             //         window.location.reload(); // refresh page
//             //     }
//             // });
//         }

//         // switch to view mode
//         setInputDisable(true);
//     };

//     const onCancelHandler = () => {
//         reset(meeting);
//         setInputDisable(true);
//     };

//     const onDeleteHandler = () => {
//         // send request to server
//         DeleteMeeting(meetingID).then((res) => {
//             console.log(res);
//         });

//         // redirect to list page
//         history.push("/meeting");
//     };

//     useEffect(() => {
//         reset(meeting);
//     }, [meeting, reset]);

//     if (loading || isSubmitting) {
//         return <p>loading...</p>;
//     }

//     if (error) {
//         return <p>{error}</p>;
//     }
//     // // fetch meeting from data
//     // useEffect(() => {
//     //     setMeeting(meetings.filter((meeting) => meeting._id == meetingID)[0]);
//     //     // console.log(meetings[meetingID]);
//     // }, [meetingID]);

//     return (
//         <div className="meeting">
//             <form className="meeting-form">
//                 <button
//                     className="detail-edit"
//                     type="button"
//                     onClick={() => history.push(`/meeting/edit/${meeting._id}`)}
//                 >
//                     edit meeting
//                 </button>

//                 <div class="meetingForm-keyInfo">
//                     <div class="meetingForm-name">
//                         {/* <text type="text" name="name" maxLength="30" placeholder="name">{meeting.name}</text> */}
//                         <text> {meeting.Title} </text>
//                     </div>
//                     <button type="button">
//                         <MdAdd size={15} />
//                     </button>
//                     <div class="meetingForm-record">
//                         <label>Location: </label>
//                         <text type="text" name="location">
//                             {meeting.Location}
//                         </text>
//                     </div>
//                 </div>

//                 <div class="meetingForm-Info">
//                     <div class="meetingForm-record">
//                         <label>Date: </label>
//                         <text name="Date">
//                             {meeting.StartTime &&
//                                 new Date(
//                                     Date(meeting.StartTime)
//                                 ).toLocaleDateString()}
//                         </text>
//                     </div>

//                     <div class="meetingForm-record">
//                         <label>Start Time: </label>
//                         <text name="Date">
//                             {meeting.StartTime &&
//                                 new Date(Date(meeting.StartTime))
//                                     .toUTCString()
//                                     .slice(17, 22)}
//                         </text>
//                     </div>

//                     <div class="meetingForm-record">
//                         <label>End Time: </label>
//                         <text name="Date">
//                             {meeting.EndTime &&
//                                 new Date(Date(meeting.EndTime))
//                                     .toUTCString()
//                                     .slice(17, 22)}
//                         </text>
//                     </div>

//                     <div class="meetingForm-record">
//                         <label>Repeat: </label>
//                         <text type="frequency" name="frequency">
//                             {meeting.Frequency}
//                         </text>
//                     </div>

//                     <div class="meetingForm-record">
//                         <label>URL: </label>
//                         <text type="url" name="url">
//                             {meeting.URL}
//                         </text>
//                     </div>
//                 </div>

//                 <div class="meetingForm-attachment">
//                     <label>Attachment: </label>
//                     <file
//                         id="form-attachmentArea"
//                         placeholder="add files..."
//                         name="attachment"
//                     >
//                         {meeting.attachment}
//                     </file>
//                 </div>

//                 <div class="meetingForm-notes">
//                     <label>Notes: </label>
//                     <text id="meetingForm-noteArea" name="notes">
//                         {meeting.Notes}
//                     </text>
//                 </div>

//                 <div class="meetingForm-keyWords">
//                     <label>Key words:</label>
//                     <text id="meetingForm-keyWordsArea" name="keyWords">
//                         {meeting.NotesKeyWords}
//                     </text>
//                 </div>
//             </form>
//         </div>
//     );
// };

// const Edit = () => {
//     let history = useHistory();
//     let { meetingID } = useParams();
//     const {
//         register,
//         formState: { errors },
//         handleSubmit,
//     } = useForm({
//         criteriaMode: "all",
//         defaultValues: meetings.filter(
//             (meeting) => meeting._id == meetingID
//         )[0],
//     });

//     const setSelectedTags = () => {
//         // set tags
//     };

//     const onSubmit = (data) => {
//         console.log(data);
//         history.push("/meeting");
//     };

//     return (
//         <div className="content">
//             <form className="meeting-form" onSubmit={handleSubmit(onSubmit)}>
//                 <button type="submit">save</button>

//                 <div class="meetingForm-keyInfo">
//                     <div class="meetingForm-name">
//                         <input type="text" {...register("Title")} />
//                     </div>

//                     <div class="meetingForm-record">
//                         <label>Location: </label>
//                         <input type="text" {...register("Location")} />
//                     </div>
//                 </div>

//                 <div class="meetingForm-Info">
//                     <div class="meetingForm-record">
//                         <label>Date: </label>
//                         <input
//                             type="date"
//                             defaultValue={new Date(
//                                 Date(meetings[meetingID].Date)
//                             ).toISOString()}
//                         />
//                     </div>

//                     <div class="meetingForm-record">
//                         <label>Start Time: </label>
//                         <input
//                             type="date"
//                             defaultValue={new Date(
//                                 Date(meetings[meetingID].Date) + meetings[meetingID].StartTime.$date.slice(0, 10)
//                             ).toISOString()}
//                         />
//                     </div>

//                     <div class="meetingForm-record">
//                         <label>End Time: </label>
//                         <input
//                             type="date"
//                             defaultValue={new Date(
//                                 Date(meetings[meetingID].Date) + meetings[meetingID].EndTime.$date.slice(0, 10)
//                             ).toISOString()}
//                         />
//                     </div>

//                     <div class="meetingForm-record">
//                         <label>Repeat: </label>
//                         <select name="frequency" {...register("Frequency")}>
//                             <option disabled selected>
//                                 --select--
//                             </option>
//                             <option>every day</option>
//                             <option>every week</option>
//                             <option>every month</option>
//                             <option>every year</option>
//                             <option>never</option>
//                         </select>
//                     </div>

//                     <div class="meetingForm-record">
//                         <label>URL: </label>
//                         <input type="url" {...register("URL")} />
//                     </div>
//                 </div>

//                 <div class="meetingForm-attachment">
//                     <label>Attachment: </label>
//                     <input
//                         class="attach"
//                         type="file"
//                         {...register("Attachment")}
//                     />
//                 </div>

//                 <div class="meetingForm-notes">
//                     <label>Notes: </label>
//                     <textarea
//                         id="meetingForm-noteArea"
//                         maxlength="140"
//                         placeholder="add notes..."
//                         {...register("Notes")}
//                     ></textarea>
//                 </div>

//                 <div class="meetingForm-keyWords">
//                     <label>Key words:</label>
//                     <textarea
//                         id="meetingForm-keyWordsArea"
//                         maxlength="60"
//                         placeholder="add key words..."
//                         {...register("NotesKeyWords")}
//                     ></textarea>
//                 </div>
//             </form>
//         </div>
//     );
// };

// decide which subPage will be render based on path

export const Meeting = () => {
    let { path } = useRouteMatch();

    return (
        <div className="three-part-layout">
            <NavigationBar />
            <SideMenu tagOf="M" />
            <Switch>
                <Route path={`${path}/create`}>
                    <MeetingCreate />
                </Route>
                <Route path={`${path}/bin`}>
                    <MeetingBin />
                </Route>
                <Route path={`${path}/tag/:tagName`}>
                    <MeetingWithTag />
                </Route>
                <Route path={`${path}/:id`}>
                    <MeetingDetail />
                </Route>
                <Route exact path={path}>
                    <MeetingAll />
                </Route>
            </Switch>
        </div>
    );
};

export default Meeting;

{/* <Box
sx={{
    gridArea: "main",
    bgcolor: "#EBF8F6",
    padding: "10px 25px",
}}
>
<Grid container direction="row" marginBottom="25px">
    <Grid item xs={4}>
        <Stack spacing={2} maxWidth="300px">
            <Input
                placeholder="Title"
                sx={{
                    fontSize: "40px",
                    width: "180px",
                }}
            />
            <Select />
            <FormField>
                <Box>Location:</Box>
                <Input />
            </FormField>
        </Stack>
    </Grid>
    <Grid item xs={4} marginRight="50px">
        <Select />
    </Grid>
    <Grid item xs={1} marginRight="50px">
        <Chip
            label="delete"
            variant="outlined"
            clickable={true}
        />
        <Chip
            label="edit"
            variant="outlined"
            clickable={true}
        />
    </Grid>
</Grid>
<Divider />
<Grid container direction="row">
    <Grid item xs={4}>
        <FormField>
            <Box>Date:</Box>
            <Input type="date" />
        </FormField>
        <FormField>
            <Box>Start Time:</Box>
            <Input type="time" />
        </FormField>
        <FormField>
            <Box>End Time:</Box>
            <Input type="time" />
        </FormField>
        <FormField>
            <Box>URL:</Box>
            <Input type="url" />
        </FormField>
        <FormField>
            <Box>Attachment:</Box>
            <Input type="file" />
        </FormField>
    </Grid>

    <Grid item xs={4} marginLeft="400px" marginTop="25px">
        <Box component={Paper} padding="10px">
            <Box>Notes</Box>
            <Input placeholder="keywords" fullWidth />
            <TextField
                multiline
                rows={5}
                placeholder="Write something..."
                fullWidth
                margin="normal"
                variant="outlined"
            />
        </Box>
    </Grid>
</Grid>
</Box> */}