<?php
    header('Content-Type:application/json');
    $uid=$_REQUEST['uid'];
    $off=$_REQUEST['off'];
    $records=$_REQUEST['records'];
    $save_time=time()*1000;
    $output=[];
    $conn=mysqli_connect('127.0.0.1','root','','Gobang',3306);
    mysqli_query($conn,'SET NAMES UTF8');
    $sql="INSERT INTO userRecords VALUES(NULL,'$uid','$off','$records','$save_time')";
    $result=mysqli_query($conn,$sql);
    if($result){
        $output['msg']='succ';
        $output['sid']=mysqli_insert_id($conn);
    }else{
        $output['msg']='fail';
        $output['reason']='SQL语句错误：'.$sql;
    }
    echo json_encode($output);